package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"shopping-list/cron/models"

	"github.com/labstack/echo/v4"
)

type MockCronService struct {
	AddFunc            func(item models.CronItem) (string, error)
	GetAllFunc         func() ([]models.CronItem, error)
	UpdateCategoryFunc func(id string, newCategory string) error
	DeleteFunc         func(id string) error
	GetByAddedByFunc   func(addedBy string) ([]models.CronItem, error)
}

func TestAddCronItem(t *testing.T) {
	t.Run("Given invalid body, When adding item, Then returns 400", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodPost, "/cron", []byte("invalid-json"))

		handler := newHandler(&MockCronService{})

		// when
		err := handler.AddCronItem(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When service succeeds, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.CronItem{
			Item:     "test",
			Category: "work",
			AddedBy:  "user1",
		})

		c, rec := setupEcho(http.MethodPost, "/cron", body)

		handler := newHandler(&MockCronService{
			AddFunc: func(item models.CronItem) (string, error) {
				return "123", nil
			},
		})

		// when
		err := handler.AddCronItem(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When adding item, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.CronItem{
			Item: "test",
		})

		c, rec := setupEcho(http.MethodPost, "/cron", body)

		handler := newHandler(&MockCronService{
			AddFunc: func(item models.CronItem) (string, error) {
				return "", errors.New("db error")
			},
		})

		// when
		err := handler.AddCronItem(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetAllCronItems(t *testing.T) {
	t.Run("Given service success, When fetching all, Then returns 200", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/cron", nil)

		handler := newHandler(&MockCronService{
			GetAllFunc: func() ([]models.CronItem, error) {
				return []models.CronItem{
					{Item: "a"},
				}, nil
			},
		})

		// when
		err := handler.GetAllCronItems(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When fetching all, Then returns 500", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/cron", nil)

		handler := newHandler(&MockCronService{
			GetAllFunc: func() ([]models.CronItem, error) {
				return nil, errors.New("error")
			},
		})

		// when
		err := handler.GetAllCronItems(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestUpdateCategory(t *testing.T) {
	t.Run("Given empty category, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.UpdateCronItemRequest{
			Category: "",
		})

		c, rec := setupEcho(http.MethodPut, "/cron/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{})

		// when
		err := handler.UpdateCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When update succeeds, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.UpdateCronItemRequest{
			Category: "new",
		})

		c, rec := setupEcho(http.MethodPut, "/cron/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{
			UpdateCategoryFunc: func(id, category string) error {
				return nil
			},
		})

		// when
		err := handler.UpdateCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestDeleteCronItem(t *testing.T) {
	t.Run("Given valid id, When delete succeeds, Then returns 200", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodDelete, "/cron/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{
			DeleteFunc: func(id string) error {
				return nil
			},
		})

		// when
		err := handler.DeleteCronItem(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, Then returns 500", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodDelete, "/cron/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{
			DeleteFunc: func(id string) error {
				return errors.New("fail")
			},
		})

		// when
		err := handler.DeleteCronItem(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetByAddedBy(t *testing.T) {
	t.Run("Given valid name, When fetching, Then returns 200", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/cron/user1", nil)
		c.SetParamNames("name")
		c.SetParamValues("user1")

		handler := newHandler(&MockCronService{
			GetByAddedByFunc: func(name string) ([]models.CronItem, error) {
				return []models.CronItem{{Item: "x"}}, nil
			},
		})

		// when
		err := handler.GetByAddedBy(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, Then returns 500", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/cron/user1", nil)
		c.SetParamNames("name")
		c.SetParamValues("user1")

		handler := newHandler(&MockCronService{
			GetByAddedByFunc: func(name string) ([]models.CronItem, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		err := handler.GetByAddedBy(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func (m *MockCronService) AddCronItem(item models.CronItem) (string, error) {
	if m.AddFunc != nil {
		return m.AddFunc(item)
	}
	return "mock-id", nil
}

func (m *MockCronService) GetAllCronItems() ([]models.CronItem, error) {
	if m.GetAllFunc != nil {
		return m.GetAllFunc()
	}
	return []models.CronItem{}, nil
}

func (m *MockCronService) UpdateCategory(id string, newCategory string) error {
	if m.UpdateCategoryFunc != nil {
		return m.UpdateCategoryFunc(id, newCategory)
	}
	return nil
}

func (m *MockCronService) Delete(id string) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(id)
	}
	return nil
}

func (m *MockCronService) GetCronItemsByAddedBy(addedBy string) ([]models.CronItem, error) {
	if m.GetByAddedByFunc != nil {
		return m.GetByAddedByFunc(addedBy)
	}
	return []models.CronItem{}, nil
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

func newHandler(mock *MockCronService) *CronHandler {
	return NewCronHandler(mock)
}
