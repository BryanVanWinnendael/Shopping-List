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
	GetLogsFunc    func(int) (*contracts.GetLogsResponse, error)
	CreateLogFunc  func(request *contracts.CreateLogRequest) (*contracts.CreateLogResponse, error)
	DeleteLogsFunc func() (*contracts.DeleteLogResponse, error)
	SearchLogsFunc func(string, int) (*contracts.SearchLogsResponse, error)
}

func TestGetLogs(t *testing.T) {
	t.Run("Given service returns logs, When GetLogs, Then returns 200 with logs", func(t *testing.T) {
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
			GetLogsFunc: func(int) (*contracts.GetLogsResponse, error) {
				return nil, errors.New("fail")
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
	t.Run("Given invalid JSON, When CreateLog, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", []byte("invalid"))
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

	t.Run("Given empty text, When CreateLog, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateLogRequest{Text: ""})
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
		body, _ := json.Marshal(contracts.CreateLogRequest{Text: "hello"})
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
		body, _ := json.Marshal(contracts.CreateLogRequest{Text: "hello"})
		c, rec := tests.SetupEcho(http.MethodPost, "/logs", body)

		handler := NewLogsHandler(&MockLogsService{
			CreateLogFunc: func(request *contracts.CreateLogRequest) (*contracts.CreateLogResponse, error) {
				return nil, errors.New("fail")
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
	t.Run("Given success, When DeleteLogs, Then returns 200", func(t *testing.T) {
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
			DeleteLogsFunc: func() (*contracts.DeleteLogResponse, error) {
				return nil, errors.New("fail")
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

func TestSearchLogs(t *testing.T) {
	t.Run("Given service returns search results, When SearchLogs, Then returns 200 with logs", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/logs/search?query=recipes", nil)

		handler := NewLogsHandler(&MockLogsService{
			SearchLogsFunc: func(query string, page int) (*contracts.SearchLogsResponse, error) {
				return &contracts.SearchLogsResponse{}, nil
			},
		})

		// when
		err := handler.SearchLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When SearchLogs, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/logs/search?query=recipes", nil)

		handler := NewLogsHandler(&MockLogsService{
			SearchLogsFunc: func(query string, page int) (*contracts.SearchLogsResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		err := handler.SearchLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given empty query, When SearchLogs, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/logs/search", nil)

		handler := NewLogsHandler(&MockLogsService{})

		// when
		err := handler.SearchLogs(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func (m *MockLogsService) GetLogs(page int) (*contracts.GetLogsResponse, error) {
	if m.GetLogsFunc != nil {
		return m.GetLogsFunc(page)
	}
	return &contracts.GetLogsResponse{}, nil
}

func (m *MockLogsService) CreateLog(request *contracts.CreateLogRequest) (*contracts.CreateLogResponse, error) {
	if m.CreateLogFunc != nil {
		return m.CreateLogFunc(request)
	}
	return &contracts.CreateLogResponse{}, nil
}

func (m *MockLogsService) DeleteLogs() (*contracts.DeleteLogResponse, error) {
	if m.DeleteLogsFunc != nil {
		return m.DeleteLogsFunc()
	}
	return &contracts.DeleteLogResponse{}, nil
}

func (m *MockLogsService) SearchLogs(query string, page int) (*contracts.SearchLogsResponse, error) {
	if m.SearchLogsFunc != nil {
		return m.SearchLogsFunc(query, page)
	}
	return &contracts.SearchLogsResponse{}, nil
}
