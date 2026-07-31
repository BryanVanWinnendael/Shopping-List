package services

import (
	"encoding/json"
	"fmt"
	"os"
	"shopping-list/logs/internal/config"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"shopping-list/shared/tests"
	"testing"
)

func TestGetLogs(t *testing.T) {
	t.Run("Given logs file with content including spans, When GetLogs, Then returns logs tree", func(t *testing.T) {
		// given
		parentSpanID := "parent-span"
		childSpanID := "child-span"
		phaseRequest := "REQUEST"
		phaseResponse := "RESPONSE"
		duration := 100
		path := "/api/test"
		status := 200

		logs := []models.Log{
			{
				Text:       "root request",
				DateTime:   "2021-01-01T00:00:00Z",
				Service:    "api",
				TraceId:    "12345",
				SpanId:     &parentSpanID,
				Phase:      &phaseRequest,
				Path:       &path,
				DurationMs: &duration,
				StatusCode: &status,
			},
			{
				Text:         "child response",
				DateTime:     "2021-01-01T00:00:01Z",
				Service:      "worker",
				TraceId:      "12345",
				SpanId:       &childSpanID,
				ParentSpanId: &parentSpanID,
				Phase:        &phaseResponse,
			},
		}

		var fileContent []byte
		for _, l := range logs {
			b, _ := json.Marshal(l)
			fileContent = append(fileContent, append(b, '\n')...)
		}

		setup(t, fileContent)

		service := NewLogsService()

		// when
		res, err := service.GetLogs(1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res.PageSize != 1 {
			t.Fatalf("expected 1 trace, got %d", res.PageSize)
		}

		if len(res.Traces) != 1 {
			t.Fatalf("expected 1 trace, got %d", len(res.Traces))
		}

		if len(res.Traces[0].Roots) != 1 {
			t.Fatalf("expected 1 root span, got %d", len(res.Traces[0].Roots))
		}

		root := res.Traces[0].Roots[0]

		if root.SpanID != parentSpanID {
			t.Fatalf("expected root span %s, got %s", parentSpanID, root.SpanID)
		}

		if root.Request == nil {
			t.Fatal("expected request log")
		}

		if len(root.Children) != 1 {
			t.Fatalf("expected 1 child span, got %d", len(root.Children))
		}

		if root.Children[0].Response == nil {
			t.Fatal("expected child response log")
		}
	})

	t.Run("Given missing file, When GetLogs, Then returns error", func(t *testing.T) {
		// given
		service := NewLogsService()

		// when
		_, err := service.GetLogs(1)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})

	t.Run("Given fewer logs than requested page, When GetLogs, Then returns empty traces", func(t *testing.T) {
		// given
		logs := []models.Log{
			{
				Text:     "log1",
				DateTime: "2021-01-01T00:00:00Z",
				Service:  "test",
				TraceId:  "12345",
			},
		}

		var fileContent []byte
		for _, l := range logs {
			b, _ := json.Marshal(l)
			fileContent = append(fileContent, append(b, '\n')...)
		}

		setup(t, fileContent)

		service := NewLogsService()

		// when
		res, err := service.GetLogs(2)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res.Page != 2 {
			t.Fatalf("expected page 2, got %d", res.Page)
		}

		if res.PageSize != pageSize {
			t.Fatalf("expected page size %d, got %d", pageSize, res.PageSize)
		}

		if res.TotalTraces != 1 {
			t.Fatalf("expected 1 total trace, got %d", res.TotalTraces)
		}

		if res.HasNext {
			t.Fatal("expected HasNext to be false")
		}

		if len(res.Traces) != 0 {
			t.Fatalf("expected empty traces, got %d", len(res.Traces))
		}
	})

	t.Run("Given child span with missing parent, When GetLogs, Then creates parent span", func(t *testing.T) {
		// given
		childSpanID := "child-span"
		parentSpanID := "missing-parent"

		phase := "REQUEST"

		logs := []models.Log{
			{
				Text:         "child log",
				DateTime:     "2021-01-01T00:00:00Z",
				Service:      "worker",
				TraceId:      "trace-1",
				SpanId:       &childSpanID,
				ParentSpanId: &parentSpanID,
				Phase:        &phase,
			},
		}

		var fileContent []byte
		for _, l := range logs {
			b, _ := json.Marshal(l)
			fileContent = append(fileContent, append(b, '\n')...)
		}

		setup(t, fileContent)

		service := NewLogsService()

		// when
		res, err := service.GetLogs(1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if len(res.Traces) != 1 {
			t.Fatalf("expected 1 trace, got %d", len(res.Traces))
		}

		if len(res.Traces[0].Roots) != 1 {
			t.Fatalf("expected 1 root span, got %d", len(res.Traces[0].Roots))
		}

		root := res.Traces[0].Roots[0]

		if root.SpanID != parentSpanID {
			t.Fatalf("expected parent span %s, got %s", parentSpanID, root.SpanID)
		}

		if len(root.Children) != 1 {
			t.Fatalf("expected 1 child span, got %d", len(root.Children))
		}

		if root.Children[0].SpanID != childSpanID {
			t.Fatalf("expected child span %s, got %s", childSpanID, root.Children[0].SpanID)
		}
	})
}

func TestCreateLog(t *testing.T) {
	t.Run("Given valid request, When CreateLog, Then writes to file", func(t *testing.T) {
		// given
		setup(t, nil)

		service := NewLogsService()
		request := contracts.CreateLogRequest{
			Text:     "mock-log",
			Service:  "test",
			TraceId:  "12345",
			DateTime: "2021-01-01T00:00:00Z",
		}

		// when
		res, err := service.CreateLog(&request)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		data, err := os.ReadFile(config.Vars.LogsFile)
		if err != nil {
			t.Fatalf("failed to read file: %v", err)
		}

		var log models.Log
		err = json.Unmarshal(data[:len(data)-1], &log)
		if err != nil {
			t.Fatalf("invalid json written: %v", err)
		}

		if log.Text != "mock-log" {
			t.Fatalf("expected 'mock-log', got '%s'", log.Text)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given multiple writes, When CreateLog, Then appends correctly", func(t *testing.T) {
		// given
		setup(t, nil)

		service := NewLogsService()

		// when
		_, _ = service.CreateLog(&contracts.CreateLogRequest{
			Text:     "mock-log",
			Service:  "test",
			TraceId:  "12345",
			DateTime: "2021-01-01T00:00:00Z",
		})
		_, _ = service.CreateLog(&contracts.CreateLogRequest{
			Text:     "mock-log2",
			Service:  "test",
			TraceId:  "12345",
			DateTime: "2021-01-01T00:00:00Z",
		})

		// then
		data, err := os.ReadFile(config.Vars.LogsFile)
		if err != nil {
			t.Fatalf("failed to read file: %v", err)
		}

		lines := 0
		for _, b := range data {
			if b == '\n' {
				lines++
			}
		}

		if lines != 2 {
			t.Fatalf("expected 2 log lines, got %d", lines)
		}
	})
}

func TestDeleteLogs(t *testing.T) {
	t.Run("Given existing logs, When DeleteLogs, Then clears file", func(t *testing.T) {
		// given
		setup(t, []byte("something\n"))

		service := NewLogsService()

		// when
		res, err := service.DeleteLogs()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		data, err := os.ReadFile(config.Vars.LogsFile)
		if err != nil {
			t.Fatalf("failed to read file: %v", err)
		}

		if len(data) != 0 {
			t.Fatalf("expected empty file, got '%s'", string(data))
		}

		if res.Message != "logs deleted successfully" {
			t.Fatalf("unexpected message: %s", res.Message)
		}
	})
}

func TestCompress(t *testing.T) {
	t.Run("Given text, When compress, Then returns compressed base64 value", func(t *testing.T) {
		// given
		text := "hello world"

		// when
		result := compress(&text)

		// then
		if result == nil {
			t.Fatal("expected compressed value, got nil")
		}

		if *result == "" {
			t.Fatal("expected non-empty compressed value")
		}
	})

	t.Run("Given nil text, When compress, Then returns nil", func(t *testing.T) {
		// given
		var text *string

		// when
		result := compress(text)

		// then
		if result != nil {
			t.Fatal("expected nil result")
		}
	})

	t.Run("Given empty text, When compress, Then returns nil", func(t *testing.T) {
		// given
		text := ""

		// when
		result := compress(&text)

		// then
		if result != nil {
			t.Fatal("expected nil result")
		}
	})
}

func TestSearchLogs(t *testing.T) {
	t.Run("Given logs with matching service, When SearchLogs, Then returns matching trace", func(t *testing.T) {
		// given
		logs := []models.Log{
			{
				Text:     "incoming request",
				Service:  "Recipes µS",
				TraceId:  "trace-1",
				DateTime: "2021-01-01T00:00:00Z",
			},
			{
				Text:     "notification sent",
				Service:  "Notifications µS",
				TraceId:  "trace-2",
				DateTime: "2021-01-01T00:00:01Z",
			},
		}

		var content []byte
		for _, l := range logs {
			b, _ := json.Marshal(l)
			content = append(content, append(b, '\n')...)
		}

		setup(t, content)

		service := NewLogsService()

		// when
		res, err := service.SearchLogs("recipes", 1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res.TotalTraces != 1 {
			t.Fatalf("expected 1 trace, got %d", res.TotalTraces)
		}

		if len(res.Traces) != 1 {
			t.Fatalf("expected 1 result, got %d", len(res.Traces))
		}

		if res.Traces[0].TraceID != "trace-1" {
			t.Fatalf("expected trace-1, got %s", res.Traces[0].TraceID)
		}
	})

	t.Run("Given uppercase query, When SearchLogs, Then search is case insensitive", func(t *testing.T) {
		// given
		serviceName := "Recipes µS"

		log := models.Log{
			Text:     "incoming request",
			Service:  serviceName,
			TraceId:  "trace-1",
			DateTime: "2021-01-01T00:00:00Z",
		}

		b, _ := json.Marshal(log)

		setup(t, append(b, '\n'))

		service := NewLogsService()

		// when
		res, err := service.SearchLogs("RECIPES", 1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if len(res.Traces) != 1 {
			t.Fatalf("expected 1 trace, got %d", len(res.Traces))
		}
	})

	t.Run("Given no matching logs, When SearchLogs, Then returns empty result", func(t *testing.T) {
		// given
		log := models.Log{
			Text:     "hello world",
			Service:  "api",
			TraceId:  "trace-1",
			DateTime: "2021-01-01T00:00:00Z",
		}

		b, _ := json.Marshal(log)

		setup(t, append(b, '\n'))

		service := NewLogsService()

		// when
		res, err := service.SearchLogs("recipes", 1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res.TotalTraces != 0 {
			t.Fatalf("expected 0 traces, got %d", res.TotalTraces)
		}

		if len(res.Traces) != 0 {
			t.Fatalf("expected empty traces, got %d", len(res.Traces))
		}
	})

	t.Run("Given multiple matching logs, When SearchLogs, Then returns next page", func(t *testing.T) {
		// given
		var content []byte

		for i := 0; i < 15; i++ {
			log := models.Log{
				Text:     "recipe request",
				Service:  "Recipes µS",
				TraceId:  fmt.Sprintf("trace-%d", i),
				DateTime: "2021-01-01T00:00:00Z",
			}

			b, _ := json.Marshal(log)
			content = append(content, append(b, '\n')...)
		}

		setup(t, content)

		service := NewLogsService()

		// when
		res, err := service.SearchLogs("recipes", 2)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res.Page != 2 {
			t.Fatalf("expected page 2, got %d", res.Page)
		}

		if res.PageSize != 50 {
			t.Fatalf("expected 50 results, got %d", res.PageSize)
		}

		if res.TotalTraces != 15 {
			t.Fatalf("expected 15 total traces, got %d", res.TotalTraces)
		}

		if res.HasNext {
			t.Fatal("expected no next page")
		}
	})

	t.Run("Given matching path, When SearchLogs, Then returns full trace", func(t *testing.T) {
		// given
		path := "/api/recipes/users"
		spanID := "span-root-1"
		spanChildID := "span-child-1"
		phaseRequest := "REQUEST"
		phaseResponse := "RESPONSE"

		logs := []models.Log{
			{
				Text:     "incoming request",
				Service:  "api gateway",
				TraceId:  "trace-id",
				DateTime: "2021-01-01T00:00:00Z",
				Path:     &path,
				SpanId:   &spanID,
				Phase:    &phaseRequest,
			},
			{
				Text:         "database request",
				Service:      "database",
				TraceId:      "trace-id",
				DateTime:     "2021-01-01T00:00:01Z",
				SpanId:       &spanChildID,
				ParentSpanId: &spanID,
				Phase:        &phaseRequest,
			},
			{
				Text:     "request completed",
				Service:  "api gateway",
				TraceId:  "trace-id",
				DateTime: "2021-01-01T00:00:02Z",
				Path:     &path,
				SpanId:   &spanID,
				Phase:    &phaseResponse,
			},
		}

		var data []byte

		for _, log := range logs {
			b, _ := json.Marshal(log)
			data = append(data, b...)
			data = append(data, '\n')
		}

		setup(t, data)

		service := NewLogsService()

		// when
		res, err := service.SearchLogs("/recipes", 1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if len(res.Traces) != 1 {
			t.Fatalf("expected 1 trace, got %d", len(res.Traces))
		}

		trace := res.Traces[0]

		if trace.TraceID != "trace-id" {
			t.Fatalf("expected trace-id, got %s", trace.TraceID)
		}

		if len(trace.Roots) != 1 {
			t.Fatalf("expected 1 root, got %d", len(trace.Roots))
		}

		root := trace.Roots[0]

		if root.SpanID != "span-root-1" {
			t.Fatalf("expected root span-root-1, got %s", root.SpanID)
		}

		if len(root.Children) != 1 {
			t.Fatalf("expected 1 child, got %d", len(root.Children))
		}

		child := root.Children[0]

		if child.SpanID != "span-child-1" {
			t.Fatalf("expected child span-child-1, got %s", child.SpanID)
		}
	})
}

func setup(t *testing.T, data []byte) {
	config.Vars.LogsFile = "test.txt"
	tests.SetupFile(t, "test.txt", data)
}
