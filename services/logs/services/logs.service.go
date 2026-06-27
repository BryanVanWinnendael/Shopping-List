package services

import (
	"bufio"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"shopping-list/logs/internal/config"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"strings"
	"sync"
)

func NewLogsService() *LogsService {
	return &LogsService{}
}

type LogsService struct{}

var mu sync.Mutex

const pageSize = 10

func (ls *LogsService) GetLogs(page int) (*contracts.GetLogsResponse, error) {
	mu.Lock()
	defer mu.Unlock()

	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)

	file, err := os.Open(logsPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	type spanMap map[string]*models.SpanNode
	traces := map[string]spanMap{}

	scanner := bufio.NewScanner(file)

	const maxLineSize = 10 * 1024 * 1024 // 10 MB
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

	// Stop if payload becomes too large (~1 MB)
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

	HasNext := start+len(selected) < len(allTraces)

	return &contracts.GetLogsResponse{
		Page:        page,
		PageSize:    len(selected),
		TotalTraces: len(allTraces),
		HasNext:     HasNext,
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
	defer file.Close()

	log := models.Log{
		Text:             request.Text,
		Service:          request.Service,
		TraceId:          request.TraceId,
		DateTime:         request.DateTime,
		Phase:            stringPtrTrimOrNil(request.Phase),
		DurationMs:       intPtrOrNil(request.DurationMs),
		StatusCode:       intPtrOrNil(request.StatusCode),
		SpanId:           stringPtrTrimOrNil(request.SpanId),
		ParentSpanId:     stringPtrTrimOrNil(request.ParentSpanId),
		RequestBodyHash:  encrypt(request.RequestBody),
		RequestBodySize:  floatPtrOrNil(request.RequestBodySize),
		ResponseBodyHash: encrypt(request.ResponseBody),
		ResponseBodySize: floatPtrOrNil(request.ResponseBodySize),
		Path:             stringPtrTrimOrNil(request.Path),
		HttpMethod:       stringPtrTrimOrNil(request.HttpMethod),
		Error:            request.Error,
	}

	jsonData, err := json.Marshal(log)
	if err != nil {
		return nil, err
	}

	_, err = file.WriteString(string(jsonData) + "\n")
	if err != nil {
		return nil, err
	}

	return &contracts.CreateLogResponse{
		DateTime:   request.DateTime,
		Text:       request.Text,
		Service:    request.Service,
		TraceId:    request.TraceId,
		HttpMethod: stringPtrTrimOrNil(request.HttpMethod),
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

func encrypt(text *string) *string {
	if text == nil {
		return nil
	}

	block, err := aes.NewCipher([]byte(config.Vars.EncryptKey))
	if err != nil {
		return nil
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(*text), nil)

	result := base64.StdEncoding.EncodeToString(ciphertext)
	return &result
}
