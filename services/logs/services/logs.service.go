package services

import (
	"bufio"
	"bytes"
	"compress/gzip"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"shopping-list/logs/internal/config"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"sort"
	"strings"
	"sync"
	"time"
)

func NewLogsService() *LogsService {
	return &LogsService{}
}

type LogsService struct{}

var mu sync.Mutex

const (
	pageSize      = 10
	maxLogEntries = 50
)

func (ls *LogsService) GetLogs(page int) (*contracts.GetLogsResponse, error) {
	mu.Lock()
	defer mu.Unlock()

	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)

	file, err := os.Open(logsPath)
	if err != nil {
		return nil, err
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			fmt.Printf("failed to close response body: %v\n", err)
		}
	}(file)

	type spanMap map[string]*models.SpanNode

	type traceWithMeta struct {
		TraceID string
		Roots   []*models.SpanNode
		Latest  time.Time
	}

	traces := map[string]spanMap{}
	traceMeta := map[string]*traceWithMeta{}

	scanner := bufio.NewScanner(file)

	const maxLineSize = 10 * 1024 * 1024
	buf := make([]byte, 0, 64*1024)
	scanner.Buffer(buf, maxLineSize)

	for scanner.Scan() {
		var log models.Log

		if err := json.Unmarshal(scanner.Bytes(), &log); err != nil {
			continue
		}

		if log.TraceId == "" {
			continue
		}

		traceID := log.TraceId

		if _, ok := traces[traceID]; !ok {
			traces[traceID] = spanMap{}
		}

		if _, ok := traceMeta[traceID]; !ok {
			traceMeta[traceID] = &traceWithMeta{
				TraceID: traceID,
			}
		}

		meta := traceMeta[traceID]

		if log.DateTime != "" {
			if t, err := time.Parse(time.RFC3339, log.DateTime); err == nil {
				if t.After(meta.Latest) {
					meta.Latest = t
				}
			}
		}

		nodes := traces[traceID]

		spanID := ""
		if log.SpanId != nil {
			spanID = *log.SpanId
		} else {
			spanID = "root-" + traceID
		}

		parentID := ""
		if log.ParentSpanId != nil {
			parentID = *log.ParentSpanId
		}

		node, ok := nodes[spanID]
		if !ok {
			node = &models.SpanNode{
				SpanID:       spanID,
				ParentSpanID: parentID,
				Service:      log.Service,
			}
			nodes[spanID] = node
		}

		if node.Service == "" {
			node.Service = log.Service
		}

		if log.Phase != nil {
			switch *log.Phase {
			case "REQUEST":
				node.Request = &log
			case "RESPONSE":
				node.Response = &log
			}
		}

		if parentID != "" {
			parent, ok := nodes[parentID]
			if !ok {
				parent = &models.SpanNode{
					SpanID: parentID,
				}
				nodes[parentID] = parent
			}

			found := false
			for _, child := range parent.Children {
				if child.SpanID == node.SpanID {
					found = true
					break
				}
			}

			if !found {
				parent.Children = append(parent.Children, node)
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	allTraces := make([]*models.Trace, 0, len(traces))

	for traceID, nodes := range traces {
		var roots []*models.SpanNode

		for _, node := range nodes {
			if node.ParentSpanID == "" {
				roots = append(roots, node)
			}
		}

		allTraces = append(allTraces, &models.Trace{
			TraceID: traceID,
			Roots:   roots,
		})
	}

	sort.Slice(allTraces, func(i, j int) bool {
		var ti, tj time.Time

		if len(allTraces[i].Roots) > 0 &&
			allTraces[i].Roots[0].Request != nil &&
			allTraces[i].Roots[0].Request.DateTime != "" {
			ti, _ = time.Parse(time.RFC3339, allTraces[i].Roots[0].Request.DateTime)
		}

		if len(allTraces[j].Roots) > 0 &&
			allTraces[j].Roots[0].Request != nil &&
			allTraces[j].Roots[0].Request.DateTime != "" {
			tj, _ = time.Parse(time.RFC3339, allTraces[j].Roots[0].Request.DateTime)
		}

		return ti.After(tj)
	})

	if page < 1 {
		page = 1
	}

	start := (page - 1) * pageSize

	if start >= len(allTraces) {
		return &contracts.GetLogsResponse{
			Page:        page,
			PageSize:    pageSize,
			TotalTraces: len(allTraces),
			HasNext:     false,
			Traces:      []*models.Trace{},
		}, nil
	}

	const maxResponseBytes = 1 * 1024 * 1024

	selected := make([]*models.Trace, 0, pageSize)
	currentSize := 0

	for i := start; i < len(allTraces) && len(selected) < pageSize; i++ {
		b, err := json.Marshal(allTraces[i])
		if err != nil {
			continue
		}

		if currentSize+len(b) > maxResponseBytes {
			break
		}

		currentSize += len(b)
		selected = append(selected, allTraces[i])
	}

	hasNext := start+len(selected) < len(allTraces)

	return &contracts.GetLogsResponse{
		Page:        page,
		PageSize:    len(selected),
		TotalTraces: len(allTraces),
		HasNext:     hasNext,
		Traces:      selected,
	}, nil
}

func (ls *LogsService) CreateLog(request *contracts.CreateLogRequest) (*contracts.CreateLogResponse, error) {
	mu.Lock()
	defer mu.Unlock()

	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)

	file, err := os.OpenFile(logsPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}

	log := models.Log{
		Text:                   request.Text,
		Service:                request.Service,
		TraceId:                request.TraceId,
		DateTime:               request.DateTime,
		Phase:                  stringPtrTrimOrNil(request.Phase),
		DurationMs:             intPtrOrNil(request.DurationMs),
		StatusCode:             intPtrOrNil(request.StatusCode),
		SpanId:                 stringPtrTrimOrNil(request.SpanId),
		ParentSpanId:           stringPtrTrimOrNil(request.ParentSpanId),
		RequestBodyCompressed:  compress(request.RequestBody),
		RequestBodySize:        floatPtrOrNil(request.RequestBodySize),
		ResponseBodyCompressed: compress(request.ResponseBody),
		ResponseBodySize:       floatPtrOrNil(request.ResponseBodySize),
		Path:                   stringPtrTrimOrNil(request.Path),
		HttpMethod:             (*models.Action)(stringPtrTrimOrNil(request.HttpMethod)),
		Error:                  request.Error,
	}

	jsonData, err := json.Marshal(log)
	if err != nil {
		_ = file.Close()
		return nil, err
	}

	_, err = file.WriteString(string(jsonData) + "\n")
	_ = file.Close()
	if err != nil {
		return nil, err
	}

	if err := ls.enforceLogEntryLimit(logsPath); err != nil {
		return nil, err
	}

	return &contracts.CreateLogResponse{
		DateTime:   request.DateTime,
		Text:       request.Text,
		Service:    request.Service,
		TraceId:    request.TraceId,
		HttpMethod: (*models.Action)(stringPtrTrimOrNil(request.HttpMethod)),
		Error:      request.Error,
	}, nil
}

func (ls *LogsService) DeleteLogs() (*contracts.DeleteLogResponse, error) {
	mu.Lock()
	defer mu.Unlock()

	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)

	err := os.WriteFile(logsPath, []byte(""), 0644)
	if err != nil {
		return nil, err
	}

	return &contracts.DeleteLogResponse{
		Message: "logs deleted successfully",
	}, nil
}

func stringPtrTrimOrNil(s *string) *string {
	if s == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*s)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func intPtrOrNil(i *int) *int {
	if i == nil || *i == 0 {
		return nil
	}
	return i
}

func floatPtrOrNil(f *float64) *float64 {
	if f == nil || *f == 0 {
		return nil
	}
	return f
}

func compress(text *string) *string {
	if text == nil || *text == "" {
		return nil
	}

	var buf bytes.Buffer

	gz := gzip.NewWriter(&buf)

	_, err := gz.Write([]byte(*text))
	if err != nil {
		return nil
	}

	err = gz.Close()
	if err != nil {
		return nil
	}

	encoded := base64.StdEncoding.EncodeToString(buf.Bytes())
	return &encoded
}

func (ls *LogsService) enforceLogEntryLimit(path string) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			fmt.Printf("failed to close response body: %v\n", err)
		}
	}(file)

	scanner := bufio.NewScanner(file)
	const maxLineSize = 10 * 1024 * 1024
	scanner.Buffer(make([]byte, 64*1024), maxLineSize)

	var lines []string

	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}

	if err := scanner.Err(); err != nil {
		return err
	}

	if len(lines) <= maxLogEntries {
		return nil
	}

	lines = lines[len(lines)-maxLogEntries:]

	return os.WriteFile(path, []byte(strings.Join(lines, "\n")+"\n"), 0644)
}
