package services

import (
	"encoding/json"
	"os"
	"shopping-list/logs/internal/config"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"shopping-list/shared/tests"
	"testing"
)

func TestGetLogs(t *testing.T) {
	t.Run("Given logs file with content, When GetLogs, Then returns logs", func(t *testing.T) {
		// given
		logs := []models.Log{
			{
				Text:     "log1",
				DateTime: "2021-01-01T00:00:00Z",
				Service:  "test",
				TraceId:  "12345",
			},
			{
				Text:     "log2",
				DateTime: "2021-01-01T00:00:00Z",
				Service:  "test",
				TraceId:  "123456",
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

		if res.PageSize != 2 {
			t.Fatalf("expected 2 logs, got %d", res.PageSize)
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

func setup(t *testing.T, data []byte) {
	config.Vars.LogsFile = "test.txt"
	tests.SetupFile(t, "test.txt", data)
}
