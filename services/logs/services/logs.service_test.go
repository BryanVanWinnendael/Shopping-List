package services

import (
	"os"
	"shopping-list/logs/internal/config"
	"shopping-list/shared/tests"
	"testing"
)

func TestGetLogs(t *testing.T) {
	t.Run("Given logs file with content, When GetLogs, Then returns logs", func(t *testing.T) {
		// given
		setup(t, []byte("log1\nlog2\n"))

		service := NewLogsService()

		// when
		logs, err := service.GetLogs()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(logs) != 2 {
			t.Fatalf("expected 2 logs, got %d", len(logs))
		}
	})

	t.Run("Given missing file, When GetLogs, Then returns error", func(t *testing.T) {
		// given
		service := NewLogsService()

		// when
		_, err := service.GetLogs()

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestWriteLog(t *testing.T) {
	t.Run("Given valid text, When WriteLog, Then writes to file", func(t *testing.T) {
		// given
		setup(t, nil)

		service := NewLogsService()

		// when
		err := service.WriteLog("hello")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		data, err := os.ReadFile(config.Vars.LogsFile)
		if err != nil {
			t.Fatalf("failed to read file: %v", err)
		}

		expected := "hello\n"
		if string(data) != expected {
			t.Fatalf("expected '%s', got '%s'", expected, string(data))
		}
	})

	t.Run("Given multiple writes, When WriteLog, Then appends correctly", func(t *testing.T) {
		// given
		setup(t, nil)

		service := NewLogsService()

		// when
		err := service.WriteLog("one")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		err = service.WriteLog("two")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// then
		data, err := os.ReadFile(config.Vars.LogsFile)
		if err != nil {
			t.Fatalf("failed to read file: %v", err)
		}

		expected := "one\ntwo\n"
		if string(data) != expected {
			t.Fatalf("expected '%s', got '%s'", expected, string(data))
		}
	})
}

func TestClearLogs(t *testing.T) {
	t.Run("Given existing logs, When ClearLogs, Then clears file", func(t *testing.T) {
		// given
		setup(t, []byte("log1\nlog2\n"))

		service := NewLogsService()

		// when
		err := service.ClearLogs()

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
	})
}

func setup(t *testing.T, data []byte) {
	config.Vars.LogsFile = "test.txt"
	tests.SetupFile(t, "test.txt", data)
}
