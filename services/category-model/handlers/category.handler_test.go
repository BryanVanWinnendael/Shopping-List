package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"shopping-list/category-model/models"
	"shopping-list/shared/tests"
	"testing"
)

type MockCategoryService struct {
	GetCategoryFunc    func(item string) (string, error)
	CreateCategoryFunc func(item, category string) error
}

func TestGetCategory(t *testing.T) {
	t.Run("Given missing item, When GetCategory, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/category", nil)

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

	t.Run("Given valid item, When GetCategory, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/category?item=apple", nil)

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

	t.Run("Given service error, When GetCategory, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/category?item=apple", nil)

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

func TestCreateCategory(t *testing.T) {
	t.Run("Given invalid JSON, When CreateCategory, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/category", []byte("invalid-json"))

		handler := newHandler(&MockCategoryService{})

		// when
		err := handler.CreateCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given missing fields, When CreateCategory, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.CreateCategoryRequest{
			Item:     "",
			Category: "",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/category", body)

		handler := newHandler(&MockCategoryService{})

		// when
		err := handler.CreateCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When CreateCategory, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.CreateCategoryRequest{
			Item:     " apple ",
			Category: " fruit ",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/category", body)

		handler := newHandler(&MockCategoryService{
			CreateCategoryFunc: func(item, category string) error {
				return nil
			},
		})

		// when
		err := handler.CreateCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When CreateCategory, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.CreateCategoryRequest{
			Item:     "apple",
			Category: "fruit",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/category", body)

		handler := newHandler(&MockCategoryService{
			CreateCategoryFunc: func(item, category string) error {
				return errors.New("service error")
			},
		})

		// when
		err := handler.CreateCategory(c)

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

func (m *MockCategoryService) CreateCategory(item, category string) error {
	if m.CreateCategoryFunc != nil {
		return m.CreateCategoryFunc(item, category)
	}
	return nil
}

func newHandler(mock *MockCategoryService) *CategoryHandler {
	return NewCategoryHandler(mock)
}
