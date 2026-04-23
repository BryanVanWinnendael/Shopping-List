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
	GetAppLogsFunc    func() ([]string, error)
	CreateAppLogFunc  func(text string) error
	DeleteAppLogsFunc func() error
}

func TestGetAppLogs(t *testing.T) {
	t.Run("Given service returns logs, When GetAppLogs, Then returns 200 with logs", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			GetAppLogsFunc: func() ([]string, error) {
				return []string{"log1", "log2"}, nil
			},
		})

		// when
		err := handler.GetAppLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetAppLogs, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			GetAppLogsFunc: func() ([]string, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		err := handler.GetAppLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestCreateAppLog(t *testing.T) {
	t.Run("Given invalid JSON, When CreateAppLog, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", []byte("invalid"))
		handler := NewLogsHandler(&MockLogsService{})

		// when
		err := handler.CreateAppLog(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given empty text, When CreateAppLog, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.LogBody{Text: ""})
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)
		handler := NewLogsHandler(&MockLogsService{})

		// when
		err := handler.CreateAppLog(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When CreateAppLog, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.LogBody{Text: "hello"})
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{
			CreateAppLogFunc: func(text string) error {
				return nil
			},
		})

		// when
		err := handler.CreateAppLog(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When CreateAppLog, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.LogBody{Text: "hello"})
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{
			CreateAppLogFunc: func(text string) error {
				return errors.New("fail")
			},
		})

		// when
		err := handler.CreateAppLog(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestDeleteAppLogs(t *testing.T) {
	t.Run("Given success, When DeleteAppLogs, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			DeleteAppLogsFunc: func() error {
				return nil
			},
		})

		// when
		err := handler.DeleteAppLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteAppLogs, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			DeleteAppLogsFunc: func() error {
				return errors.New("fail")
			},
		})

		// when
		err := handler.DeleteAppLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func (m *MockLogsService) GetAppLogs() ([]string, error) {
	if m.GetAppLogsFunc != nil {
		return m.GetAppLogsFunc()
	}
	return []string{}, nil
}

func (m *MockLogsService) CreateAppLog(text string) error {
	if m.CreateAppLogFunc != nil {
		return m.CreateAppLogFunc(text)
	}
	return nil
}

func (m *MockLogsService) DeleteAppLogs() error {
	if m.DeleteAppLogsFunc != nil {
		return m.DeleteAppLogsFunc()
	}
	return nil
}
