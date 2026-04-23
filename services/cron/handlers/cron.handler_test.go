package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"shopping-list/shared/tests"
	"testing"

	"shopping-list/cron/models"
)

type MockCronService struct {
	CreateCronItemFunc         func(item models.CronItem) (string, error)
	GetAllCronItemsFunc        func() ([]models.CronItem, error)
	UpdateCronItemCategoryFunc func(id string, newCategory string) error
	DeleteCronItemFunc         func(id string) error
	GetCronItemsByUserFunc     func(addedBy string) ([]models.CronItem, error)
}

func TestCreateCronItem(t *testing.T) {
	t.Run("Given invalid body, When CreateCronItem, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/cron", []byte("invalid-json"))

		handler := newHandler(&MockCronService{})

		// when
		err := handler.CreateCronItem(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When CreateCronItem, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.CronItem{
			Item:     "test",
			Category: "work",
			AddedBy:  "user1",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/cron", body)

		handler := newHandler(&MockCronService{
			CreateCronItemFunc: func(item models.CronItem) (string, error) {
				return "123", nil
			},
		})

		// when
		err := handler.CreateCronItem(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When CreateCronItem, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.CronItem{
			Item: "test",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/cron", body)

		handler := newHandler(&MockCronService{
			CreateCronItemFunc: func(item models.CronItem) (string, error) {
				return "", errors.New("db error")
			},
		})

		// when
		err := handler.CreateCronItem(c)

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
	t.Run("Given service success, When GetAllCronItems, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/cron", nil)

		handler := newHandler(&MockCronService{
			GetAllCronItemsFunc: func() ([]models.CronItem, error) {
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

	t.Run("Given service error, When GetAllCronItems, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/cron", nil)

		handler := newHandler(&MockCronService{
			GetAllCronItemsFunc: func() ([]models.CronItem, error) {
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

func TestUpdateCronItemCategory(t *testing.T) {
	t.Run("Given empty category, When UpdateCronItemCategory, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.UpdateCronItemRequest{
			Category: "",
		})

		c, rec := tests.SetupEcho(http.MethodPut, "/cron/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{})

		// when
		err := handler.UpdateCronItemCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When UpdateCronItemCategory, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.UpdateCronItemRequest{
			Category: "new",
		})

		c, rec := tests.SetupEcho(http.MethodPut, "/cron/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{
			UpdateCronItemCategoryFunc: func(id, category string) error {
				return nil
			},
		})

		// when
		err := handler.UpdateCronItemCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given invalid body, When UpdateCronItemCategory, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPut, "/cron/1", []byte("invalid-json"))
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{})

		// when
		err := handler.UpdateCronItemCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When UpdateCronItemCategory, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.UpdateCronItemRequest{
			Category: "new",
		})

		c, rec := tests.SetupEcho(http.MethodPut, "/cron/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{
			UpdateCronItemCategoryFunc: func(id, category string) error {
				return errors.New("fail")
			},
		})

		// when
		err := handler.UpdateCronItemCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestDeleteCronItem(t *testing.T) {
	t.Run("Given valid id, When DeleteCronItem, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/cron/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{
			DeleteCronItemFunc: func(id string) error {
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

	t.Run("Given service error, When DeleteCronItem, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/cron/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{
			DeleteCronItemFunc: func(id string) error {
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

func TestGetCronItemsByUser(t *testing.T) {
	t.Run("Given valid name, When GetCronItemsByUser, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/cron/user1", nil)
		c.SetParamNames("name")
		c.SetParamValues("user1")

		handler := newHandler(&MockCronService{
			GetCronItemsByUserFunc: func(name string) ([]models.CronItem, error) {
				return []models.CronItem{{Item: "x"}}, nil
			},
		})

		// when
		err := handler.GetCronItemsByUser(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetCronItemsByUser, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/cron/user1", nil)
		c.SetParamNames("name")
		c.SetParamValues("user1")

		handler := newHandler(&MockCronService{
			GetCronItemsByUserFunc: func(name string) ([]models.CronItem, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		err := handler.GetCronItemsByUser(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func (m *MockCronService) CreateCronItem(item models.CronItem) (string, error) {
	if m.CreateCronItemFunc != nil {
		return m.CreateCronItemFunc(item)
	}
	return "mock-id", nil
}

func (m *MockCronService) GetAllCronItems() ([]models.CronItem, error) {
	if m.GetAllCronItemsFunc != nil {
		return m.GetAllCronItemsFunc()
	}
	return []models.CronItem{}, nil
}

func (m *MockCronService) UpdateCronItemCategory(id string, newCategory string) error {
	if m.UpdateCronItemCategoryFunc != nil {
		return m.UpdateCronItemCategoryFunc(id, newCategory)
	}
	return nil
}

func (m *MockCronService) DeleteCronItem(id string) error {
	if m.DeleteCronItemFunc != nil {
		return m.DeleteCronItemFunc(id)
	}
	return nil
}

func (m *MockCronService) GetCronItemsByUser(user string) ([]models.CronItem, error) {
	if m.GetCronItemsByUserFunc != nil {
		return m.GetCronItemsByUserFunc(user)
	}
	return []models.CronItem{}, nil
}

func newHandler(mock *MockCronService) *CronHandler {
	return NewCronHandler(mock)
}
