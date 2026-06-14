package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
	"testing"
)

type MockLogsService struct {
	GetAppLogsFunc    func(ctx context.Context) (*contracts.GetAppLogsResponse, error)
	CreateAppLogFunc  func(ctx context.Context, request *contracts.CreateAppLogRequest) (*contracts.CreateAppLogResponse, error)
	DeleteAppLogsFunc func(ctx context.Context) (*contracts.DeleteAppLogResponse, error)
}

func TestGetAppLogs(t *testing.T) {
	t.Run("Given service success, When GetAppLogs, Then returns 200", func(t *testing.T) {
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
			GetAppLogsFunc: func(context.Context) (*contracts.GetAppLogsResponse, error) {
				return nil, errors.New("failed")
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
	t.Run("Given invalid body, When CreateAppLog, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", []byte("invalid-json"))

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

	t.Run("Given missing fields, When CreateAppLog, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateAppLogRequest{})

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
		body, _ := json.Marshal(contracts.CreateAppLogRequest{
			User:   "user1",
			Action: "CREATE",
			Text:   "created shopping item",
		})

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
		body, _ := json.Marshal(contracts.CreateAppLogRequest{
			User:   "user1",
			Action: "CREATE",
			Text:   "created shopping item",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{
			CreateAppLogFunc: func(
				context.Context,
				*contracts.CreateAppLogRequest,
			) (*contracts.CreateAppLogResponse, error) {
				return nil, errors.New("insert failed")
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
	t.Run("Given service success, When DeleteAppLogs, Then returns 200", func(t *testing.T) {
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
			DeleteAppLogsFunc: func(context.Context) (*contracts.DeleteAppLogResponse, error) {
				return nil, errors.New("delete failed")
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

func (m *MockLogsService) GetAppLogs(ctx context.Context) (*contracts.GetAppLogsResponse, error) {
	if m.GetAppLogsFunc != nil {
		return m.GetAppLogsFunc(ctx)
	}
	return &contracts.GetAppLogsResponse{}, nil
}

func (m *MockLogsService) CreateAppLog(ctx context.Context, request *contracts.CreateAppLogRequest) (*contracts.CreateAppLogResponse, error) {
	if m.CreateAppLogFunc != nil {
		return m.CreateAppLogFunc(ctx, request)
	}
	return &contracts.CreateAppLogResponse{}, nil
}

func (m *MockLogsService) DeleteAppLogs(ctx context.Context) (*contracts.DeleteAppLogResponse, error) {
	if m.DeleteAppLogsFunc != nil {
		return m.DeleteAppLogsFunc(ctx)
	}
	return &contracts.DeleteAppLogResponse{}, nil
}
