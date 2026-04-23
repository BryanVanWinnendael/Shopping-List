package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"shopping-list/shared/tests"
	"testing"

	"shopping-list/logs/models"
)

type MockLogsService struct {
	GetLogsFunc  func() ([]string, error)
	WriteLogFunc func(text string) error
	ClearFunc    func() error
}

func TestGetShoppingListLogs(t *testing.T) {
	t.Run("Given service returns logs, When GetShoppingListLogs, Then returns 200 with logs", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			GetLogsFunc: func() ([]string, error) {
				return []string{"log1", "log2"}, nil
			},
		})

		// when
		err := handler.GetShoppingListLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetShoppingListLogs, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			GetLogsFunc: func() ([]string, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		err := handler.GetShoppingListLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestWriteShoppingListLog(t *testing.T) {
	t.Run("Given invalid JSON, When WriteShoppingListLog, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", []byte("invalid"))
		handler := NewLogsHandler(&MockLogsService{})

		// when
		err := handler.WriteShoppingListLog(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given empty text, When WriteShoppingListLog, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.LogBody{Text: ""})
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)
		handler := NewLogsHandler(&MockLogsService{})

		// when
		err := handler.WriteShoppingListLog(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When WriteShoppingListLog, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.LogBody{Text: "hello"})
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{
			WriteLogFunc: func(text string) error {
				return nil
			},
		})

		// when
		err := handler.WriteShoppingListLog(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When WriteShoppingListLog, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.LogBody{Text: "hello"})
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{
			WriteLogFunc: func(text string) error {
				return errors.New("fail")
			},
		})

		// when
		err := handler.WriteShoppingListLog(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestClearShoppingListLogs(t *testing.T) {
	t.Run("Given success, When ClearShoppingListLogs, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			ClearFunc: func() error {
				return nil
			},
		})

		// when
		err := handler.ClearShoppingListLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When ClearShoppingListLogs, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			ClearFunc: func() error {
				return errors.New("fail")
			},
		})

		// when
		err := handler.ClearShoppingListLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func (m *MockLogsService) GetLogs() ([]string, error) {
	if m.GetLogsFunc != nil {
		return m.GetLogsFunc()
	}
	return []string{}, nil
}

func (m *MockLogsService) WriteLog(text string) error {
	if m.WriteLogFunc != nil {
		return m.WriteLogFunc(text)
	}
	return nil
}

func (m *MockLogsService) ClearLogs() error {
	if m.ClearFunc != nil {
		return m.ClearFunc()
	}
	return nil
}
