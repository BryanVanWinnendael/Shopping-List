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
	"strconv"
	"strings"
	"sync"
	"time"
)

func NewLogsService() *LogsService {
	return &LogsService{}
}

type LogsService struct{}

type LogFilter func(*models.Log) bool

var mu sync.Mutex

const (
	pageSize      = 50
	maxLogEntries = 100 // max logs/traces in total that can be saved
)

func (ls *LogsService) GetLogs(page int) (*contracts.GetLogsResponse, error) {
	mu.Lock()
	defer mu.Unlock()

	traces, err := buildTraces(nil)
	if err != nil {
		return nil, err
	}

	return (*contracts.GetLogsResponse)(paginateTraces(traces, page)), nil
}

func (ls *LogsService) SearchLogs(query string, page int) (*contracts.SearchLogsResponse, error) {
	mu.Lock()
	defer mu.Unlock()

	query = strings.ToLower(strings.TrimSpace(query))

	traceIDs, err := findMatchingTraceIDs(query)
	if err != nil {
		return nil, err
	}

	traces, err := buildTraces(func(log *models.Log) bool {
		return traceIDs[log.TraceId]
	})

	if err != nil {
		return nil, err
	}

	return (*contracts.SearchLogsResponse)(paginateTraces(traces, page)), nil
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

	if err := enforceLogEntryLimit(logsPath); err != nil {
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

func paginateTraces(traces []*models.Trace, page int) *contracts.LogsResponse {
	if page < 1 {
		page = 1
	}

	start := (page - 1) * pageSize

	if start >= len(traces) {
		return &contracts.LogsResponse{
			Page:        page,
			PageSize:    pageSize,
			TotalTraces: len(traces),
			HasNext:     false,
			Traces:      []*models.Trace{},
		}
	}

	end := start + pageSize

	if end > len(traces) {
		end = len(traces)
	}

	return &contracts.LogsResponse{
		Page:        page,
		PageSize:    end - start,
		TotalTraces: len(traces),
		HasNext:     end < len(traces),
		Traces:      traces[start:end],
	}
}

func buildTraces(filter LogFilter) ([]*models.Trace, error) {
	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)

	file, err := os.Open(logsPath)
	if err != nil {
		return nil, err
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			fmt.Println("Error closing file:", err)
		}
	}(file)

	type spanMap map[string]*models.SpanNode

	traces := map[string]spanMap{}

	scanner := bufio.NewScanner(file)

	const maxLineSize = 10 * 1024 * 1024
	scanner.Buffer(make([]byte, 64*1024), maxLineSize)

	for scanner.Scan() {
		var log models.Log

		if err := json.Unmarshal(scanner.Bytes(), &log); err != nil {
			continue
		}

		if filter != nil && !filter(&log) {
			continue
		}

		if log.TraceId == "" {
			continue
		}

		traceID := log.TraceId

		if traces[traceID] == nil {
			traces[traceID] = spanMap{}
		}

		nodes := traces[traceID]

		spanID := "root-" + traceID
		if log.SpanId != nil {
			spanID = *log.SpanId
		}

		parentID := ""
		if log.ParentSpanId != nil {
			parentID = *log.ParentSpanId
		}

		node, exists := nodes[spanID]

		if !exists {
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

			parent, exists := nodes[parentID]

			if !exists {
				parent = &models.SpanNode{
					SpanID: parentID,
				}

				nodes[parentID] = parent
			}

			hasChild := false

			for _, child := range parent.Children {
				if child.SpanID == node.SpanID {
					hasChild = true
					break
				}
			}

			if !hasChild {
				parent.Children = append(parent.Children, node)
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	result := make([]*models.Trace, 0, len(traces))

	for traceID, nodes := range traces {

		var roots []*models.SpanNode

		for _, node := range nodes {
			if node.ParentSpanID == "" {
				roots = append(roots, node)
			}
		}

		result = append(result, &models.Trace{
			TraceID: traceID,
			Roots:   roots,
		})
	}

	sort.Slice(result, func(i, j int) bool {

		var ti, tj time.Time

		if len(result[i].Roots) > 0 &&
			result[i].Roots[0].Request != nil {

			ti, _ = time.Parse(
				time.RFC3339,
				result[i].Roots[0].Request.DateTime,
			)
		}

		if len(result[j].Roots) > 0 &&
			result[j].Roots[0].Request != nil {

			tj, _ = time.Parse(
				time.RFC3339,
				result[j].Roots[0].Request.DateTime,
			)
		}

		return ti.After(tj)
	})

	return result, nil
}

func findMatchingTraceIDs(query string) (map[string]bool, error) {
	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)

	file, err := os.Open(logsPath)
	if err != nil {
		return nil, err
	}

	defer func() {
		_ = file.Close()
	}()

	traceIDs := make(map[string]bool)

	scanner := bufio.NewScanner(file)

	const maxLineSize = 10 * 1024 * 1024
	scanner.Buffer(make([]byte, 64*1024), maxLineSize)

	for scanner.Scan() {
		var log models.Log

		if err := json.Unmarshal(scanner.Bytes(), &log); err != nil {
			continue
		}

		if log.TraceId == "" {
			continue
		}

		if matchesLogSearch(&log, query) {
			traceIDs[log.TraceId] = true
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	return traceIDs, nil
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

func enforceLogEntryLimit(path string) error {
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

func matchesLogSearch(log *models.Log, query string) bool {
	values := []string{
		log.Text,
		log.Service,
		log.TraceId,
		log.DateTime,
	}

	if log.Error != nil {
		values = append(values, strconv.FormatBool(*log.Error))
	}

	if log.Path != nil {
		values = append(values, *log.Path)
	}

	if log.SpanId != nil {
		values = append(values, *log.SpanId)
	}

	if log.ParentSpanId != nil {
		values = append(values, *log.ParentSpanId)
	}

	if log.HttpMethod != nil {
		values = append(values, string(*log.HttpMethod))
	}

	if log.Phase != nil {
		values = append(values, *log.Phase)
	}

	for _, value := range values {
		lower := strings.ToLower(value)

		if strings.Contains(lower, query) {
			return true
		}
	}

	return false
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
