package handlers

import (
	"bytes"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
)

type MockCategoryService struct {
	GetCategoryFunc func(item string) (string, error)
	AddCategoryFunc func(item, category string) error
}

func TestGetCategory(t *testing.T) {
	t.Run("Given missing item, When calling endpoint, Then returns 400", func(t *testing.T) {
		// given
		c, rec := setupEchoContext(http.MethodGet, "/category", nil)

		handler := newHandler(&MockCategoryService{})

		// when
		err := handler.GetCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid item, When service succeeds, Then returns 200", func(t *testing.T) {
		// given
		c, rec := setupEchoContext(http.MethodGet, "/category?item=apple", nil)

		handler := newHandler(&MockCategoryService{
			GetCategoryFunc: func(item string) (string, error) {
				return "fruit", nil
			},
		})

		// when
		err := handler.GetCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When calling endpoint, Then returns 500", func(t *testing.T) {
		// given
		c, rec := setupEchoContext(http.MethodGet, "/category?item=apple", nil)

		handler := newHandler(&MockCategoryService{
			GetCategoryFunc: func(item string) (string, error) {
				return "", errors.New("service error")
			},
		})

		// when
		err := handler.GetCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func (m *MockCategoryService) GetCategory(item string) (string, error) {
	if m.GetCategoryFunc != nil {
		return m.GetCategoryFunc(item)
	}
	return "mock-category", nil
}

func (m *MockCategoryService) AddCategory(item, category string) error {
	if m.AddCategoryFunc != nil {
		return m.AddCategoryFunc(item, category)
	}
	return nil
}

func setupEchoContext(method, url string, body []byte) (echo.Context, *httptest.ResponseRecorder) {
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

func newHandler(mock *MockCategoryService) *CategoryHandler {
	return NewCategoryHandler(mock)
}
