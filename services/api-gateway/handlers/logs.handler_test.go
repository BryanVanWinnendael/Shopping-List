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
	GetLogsFunc    func(ctx context.Context, page string) (*contracts.GetLogsResponse, error)
	CreateLogFunc  func(ctx context.Context, request *contracts.CreateLogRequest) (*contracts.CreateLogResponse, error)
	DeleteLogsFunc func(ctx context.Context) (*contracts.DeleteLogResponse, error)
}

func TestGetLogs(t *testing.T) {
	t.Run("Given service success, When GetLogs, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{})

		// when
		err := handler.GetLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetLogs, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			GetLogsFunc: func(context.Context, string) (*contracts.GetLogsResponse, error) {
				return nil, errors.New("failed")
			},
		})

		// when
		err := handler.GetLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestCreateLog(t *testing.T) {
	t.Run("Given invalid body, When CreateLog, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", []byte("invalid-json"))

		handler := NewLogsHandler(&MockLogsService{})

		// when
		err := handler.CreateLog(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given missing fields, When CreateLog, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateLogRequest{})

		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{})

		// when
		err := handler.CreateLog(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When CreateLog, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateLogRequest{
			Text:     "mock-log",
			Service:  "test",
			TraceId:  "12345",
			DateTime: "2021-01-01T00:00:00Z",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{})

		// when
		err := handler.CreateLog(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When CreateLog, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateLogRequest{
			Text:     "mock-log",
			Service:  "test",
			TraceId:  "12345",
			DateTime: "2021-01-01T00:00:00Z",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{
			CreateLogFunc: func(
				context.Context,
				*contracts.CreateLogRequest,
			) (*contracts.CreateLogResponse, error) {
				return nil, errors.New("insert failed")
			},
		})

		// when
		err := handler.CreateLog(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestDeleteLogs(t *testing.T) {
	t.Run("Given service success, When DeleteLogs, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{})

		// when
		err := handler.DeleteLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteLogs, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/logs", nil)

		handler := NewLogsHandler(&MockLogsService{
			DeleteLogsFunc: func(context.Context) (*contracts.DeleteLogResponse, error) {
				return nil, errors.New("delete failed")
			},
		})

		// when
		err := handler.DeleteLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func (m *MockLogsService) GetLogs(ctx context.Context, page string) (*contracts.GetLogsResponse, error) {
	if m.GetLogsFunc != nil {
		return m.GetLogsFunc(ctx, page)
	}
	return &contracts.GetLogsResponse{}, nil
}

func (m *MockLogsService) CreateLog(ctx context.Context, request *contracts.CreateLogRequest) (*contracts.CreateLogResponse, error) {
	if m.CreateLogFunc != nil {
		return m.CreateLogFunc(ctx, request)
	}
	return &contracts.CreateLogResponse{}, nil
}

func (m *MockLogsService) DeleteLogs(ctx context.Context) (*contracts.DeleteLogResponse, error) {
	if m.DeleteLogsFunc != nil {
		return m.DeleteLogsFunc(ctx)
	}
	return &contracts.DeleteLogResponse{}, nil
}
