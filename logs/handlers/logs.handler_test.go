package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"shopping-list/logs/models"

	"github.com/labstack/echo/v4"
)

type MockLogsService struct {
	GetLogsFunc  func() ([]string, error)
	WriteLogFunc func(text string) error
	ClearFunc    func() error
}

func TestGetShoppingListLogs(t *testing.T) {
	t.Run("Given success, Then returns logs", func(t *testing.T) {
		c, rec := setupEcho(http.MethodGet, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			GetLogsFunc: func() ([]string, error) {
				return []string{"log1", "log2"}, nil
			},
		})

		err := handler.GetShoppingListLogs(c)

		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, Then returns 500", func(t *testing.T) {
		c, rec := setupEcho(http.MethodGet, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			GetLogsFunc: func() ([]string, error) {
				return nil, errors.New("fail")
			},
		})

		err := handler.GetShoppingListLogs(c)

		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestWriteShoppingListLog(t *testing.T) {
	t.Run("Given invalid JSON, Then returns 400", func(t *testing.T) {
		c, rec := setupEcho(http.MethodPost, "/logs", []byte("invalid"))

		handler := NewLogsHandler(&MockLogsService{})

		err := handler.WriteShoppingListLog(c)

		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given empty text, Then returns 400", func(t *testing.T) {
		body, _ := json.Marshal(models.LogBody{Text: ""})
		c, rec := setupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{})

		err := handler.WriteShoppingListLog(c)

		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given success, Then returns 200", func(t *testing.T) {
		body, _ := json.Marshal(models.LogBody{Text: "hello"})
		c, rec := setupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{
			WriteLogFunc: func(text string) error {
				return nil
			},
		})

		err := handler.WriteShoppingListLog(c)

		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, Then returns 500", func(t *testing.T) {
		body, _ := json.Marshal(models.LogBody{Text: "hello"})
		c, rec := setupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{
			WriteLogFunc: func(text string) error {
				return errors.New("fail")
			},
		})

		err := handler.WriteShoppingListLog(c)

		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestClearShoppingListLogs(t *testing.T) {
	t.Run("Given success, Then returns 200", func(t *testing.T) {
		c, rec := setupEcho(http.MethodDelete, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			ClearFunc: func() error {
				return nil
			},
		})

		err := handler.ClearShoppingListLogs(c)

		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, Then returns 500", func(t *testing.T) {
		c, rec := setupEcho(http.MethodDelete, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			ClearFunc: func() error {
				return errors.New("fail")
			},
		})

		err := handler.ClearShoppingListLogs(c)

		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func setupEcho(method, url string, body []byte) (echo.Context, *httptest.ResponseRecorder) {
	e := echo.New()

	var req *http.Request
	if body != nil {
		req = httptest.NewRequest(method, url, bytes.NewBuffer(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	} else {
		req = httptest.NewRequest(method, url, nil)
	}

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	return c, rec
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
