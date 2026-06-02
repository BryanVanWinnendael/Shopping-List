package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
	"testing"
)

type MockLogsService struct {
	GetAppLogsFunc    func() (*contracts.GetAppLogsResponse, error)
	CreateAppLogFunc  func(request *contracts.CreateAppLogRequest) (*contracts.CreateAppLogResponse, error)
	DeleteAppLogsFunc func() (*contracts.DeleteAppLogResponse, error)
}

func TestGetAppLogs(t *testing.T) {
	t.Run("Given service returns logs, When GetAppLogs, Then returns 200 with logs", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{})

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
			GetAppLogsFunc: func() (*contracts.GetAppLogsResponse, error) {
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
		body, _ := json.Marshal(contracts.CreateAppLogRequest{Text: ""})
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
		body, _ := json.Marshal(contracts.CreateAppLogRequest{Text: "hello"})
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{})

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
		body, _ := json.Marshal(contracts.CreateAppLogRequest{Text: "hello"})
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{
			CreateAppLogFunc: func(request *contracts.CreateAppLogRequest) (*contracts.CreateAppLogResponse, error) {
				return nil, errors.New("fail")
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

		handler := NewLogsHandler(&MockLogsService{})

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
			DeleteAppLogsFunc: func() (*contracts.DeleteAppLogResponse, error) {
				return nil, errors.New("fail")
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

func (m *MockLogsService) GetAppLogs() (*contracts.GetAppLogsResponse, error) {
	if m.GetAppLogsFunc != nil {
		return m.GetAppLogsFunc()
	}
	return &contracts.GetAppLogsResponse{
		{
			Text: "log1",
		},
		{
			Text: "log2",
		},
	}, nil
}

func (m *MockLogsService) CreateAppLog(request *contracts.CreateAppLogRequest) (*contracts.CreateAppLogResponse, error) {
	if m.CreateAppLogFunc != nil {
		return m.CreateAppLogFunc(request)
	}
	return &contracts.CreateAppLogResponse{
		Text: request.Text,
	}, nil
}

func (m *MockLogsService) DeleteAppLogs() (*contracts.DeleteAppLogResponse, error) {
	if m.DeleteAppLogsFunc != nil {
		return m.DeleteAppLogsFunc()
	}
	return &contracts.DeleteAppLogResponse{
		Message: "App logs Deleted Successfully",
	}, nil
}
