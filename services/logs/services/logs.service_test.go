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

func TestGetAppLogs(t *testing.T) {
	t.Run("Given logs file with content, When GetAppLogs, Then returns logs", func(t *testing.T) {
		// given
		logs := []models.Log{
			{Text: "log1"},
			{Text: "log2"},
		}

		var fileContent []byte
		for _, l := range logs {
			b, _ := json.Marshal(l)
			fileContent = append(fileContent, append(b, '\n')...)
		}

		setup(t, fileContent)

		service := NewLogsService()

		// when
		res, err := service.GetAppLogs()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if len(*res) != 2 {
			t.Fatalf("expected 2 logs, got %d", len(*res))
		}
	})

	t.Run("Given missing file, When GetAppLogs, Then returns error", func(t *testing.T) {
		// given
		service := NewLogsService()

		// when
		_, err := service.GetAppLogs()

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestCreateAppLog(t *testing.T) {
	t.Run("Given valid text, When CreateAppLog, Then writes to file", func(t *testing.T) {
		// given
		setup(t, nil)

		service := NewLogsService()
		request := contracts.CreateAppLogRequest{
			Text: "mock-log",
		}

		// when
		res, err := service.CreateAppLog(&request)

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

	t.Run("Given multiple writes, When CreateAppLog, Then appends correctly", func(t *testing.T) {
		// given
		setup(t, nil)

		service := NewLogsService()

		// when
		_, _ = service.CreateAppLog(&contracts.CreateAppLogRequest{Text: "log1"})
		_, _ = service.CreateAppLog(&contracts.CreateAppLogRequest{Text: "log2"})

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

func TestDeleteAppLogs(t *testing.T) {
	t.Run("Given existing logs, When DeleteAppLogs, Then clears file", func(t *testing.T) {
		// given
		setup(t, []byte("something\n"))

		service := NewLogsService()

		// when
		res, err := service.DeleteAppLogs()

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

		if res.Message != "app logs deleted successfully" {
			t.Fatalf("unexpected message: %s", res.Message)
		}
	})
}

func setup(t *testing.T, data []byte) {
	config.Vars.LogsFile = "test.txt"
	tests.SetupFile(t, "test.txt", data)
}
