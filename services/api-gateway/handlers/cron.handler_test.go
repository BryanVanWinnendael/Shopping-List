package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"testing"

	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
)

type MockCronService struct {
	CreateCronProductFunc         func(ctx context.Context, request *contracts.CreateCronProductRequest) (*contracts.CreateCronProductResponse, error)
	GetAllCronProductsFunc        func(ctx context.Context) (*contracts.GetAllCronProductsResponse, error)
	DeleteCronProductFunc         func(ctx context.Context, id string) (*contracts.DeleteCronProductResponse, error)
	GetCronProductsByUserFunc     func(ctx context.Context, user string) (*contracts.GetCronProductsByUserResponse, error)
	UpdateCronProductCategoryFunc func(ctx context.Context, id string, request *contracts.UpdateCronProductCategoryRequest) (*contracts.UpdateCronProductCategoryResponse, error)
}

func TestCreateCronProduct(t *testing.T) {
	t.Run("Given invalid body, When CreateCronProduct, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/cron", []byte("invalid-json"))

		handler := NewCronHandler(&MockCronService{})

		// when
		err := handler.CreateCronProduct(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given missing fields, When CreateCronProduct, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateCronProductRequest{})

		c, rec := tests.SetupEcho(http.MethodPost, "/cron", body)

		handler := newHandler(&MockCronService{})

		// when
		err := handler.CreateCronProduct(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When CreateCronProduct, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateCronProductRequest{
			Product:  "test",
			Category: "work",
			User:     "user1",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/cron", body)

		handler := newHandler(&MockCronService{})

		// when
		err := handler.CreateCronProduct(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When CreateCronProduct, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateCronProductRequest{
			Product:  "test",
			Category: "work",
			User:     "user1",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/cron", body)

		handler := newHandler(&MockCronService{
			CreateCronProductFunc: func(
				context.Context,
				*contracts.CreateCronProductRequest,
			) (*contracts.CreateCronProductResponse, error) {
				return nil, errors.New("db error")
			},
		})

		// when
		err := handler.CreateCronProduct(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetAllCronProducts(t *testing.T) {
	t.Run("Given success, When GetAllCronProducts, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/cron", nil)

		handler := newHandler(&MockCronService{})

		// when
		err := handler.GetAllCronProducts(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetAllCronProducts, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/cron", nil)

		handler := newHandler(&MockCronService{
			GetAllCronProductsFunc: func(
				context.Context,
			) (*contracts.GetAllCronProductsResponse, error) {
				return nil, errors.New("error")
			},
		})

		// when
		err := handler.GetAllCronProducts(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestDeleteCronProduct(t *testing.T) {
	t.Run("Given missing id, When DeleteCronProduct, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/cron", nil)

		handler := newHandler(&MockCronService{})

		// when
		err := handler.DeleteCronProduct(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid id, When DeleteCronProduct, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/cron/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{})

		// when
		err := handler.DeleteCronProduct(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteCronProduct, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/cron/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{
			DeleteCronProductFunc: func(
				context.Context,
				string,
			) (*contracts.DeleteCronProductResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		err := handler.DeleteCronProduct(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetCronProductsByUser(t *testing.T) {
	t.Run("Given missing user, When GetCronProductsByUser, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/cron", nil)

		handler := newHandler(&MockCronService{})

		// when
		err := handler.GetCronProductsByUser(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid user, When GetCronProductsByUser, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/cron/user1", nil)
		c.SetParamNames("user")
		c.SetParamValues("user1")

		handler := newHandler(&MockCronService{})

		// when
		err := handler.GetCronProductsByUser(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetCronProductsByUser, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/cron/user1", nil)
		c.SetParamNames("user")
		c.SetParamValues("user1")

		handler := newHandler(&MockCronService{
			GetCronProductsByUserFunc: func(
				context.Context,
				string,
			) (*contracts.GetCronProductsByUserResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		err := handler.GetCronProductsByUser(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestUpdateCronProductCategory(t *testing.T) {
	t.Run("Given missing id, When UpdateCronProductCategory, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateCronProductCategoryRequest{
			Category: "new",
		})

		c, rec := tests.SetupEcho(http.MethodPut, "/cron", body)

		handler := newHandler(&MockCronService{})

		// when
		err := handler.UpdateCronProductCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given invalid body, When UpdateCronProductCategory, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPut, "/cron/1", []byte("invalid-json"))
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{})

		// when
		err := handler.UpdateCronProductCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given missing category, When UpdateCronProductCategory, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateCronProductCategoryRequest{})

		c, rec := tests.SetupEcho(http.MethodPut, "/cron/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{})

		// when
		err := handler.UpdateCronProductCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When UpdateCronProductCategory, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateCronProductCategoryRequest{
			Category: "new",
		})

		c, rec := tests.SetupEcho(http.MethodPut, "/cron/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{})

		// when
		err := handler.UpdateCronProductCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When UpdateCronProductCategory, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateCronProductCategoryRequest{
			Category: "new",
		})

		c, rec := tests.SetupEcho(http.MethodPut, "/cron/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newHandler(&MockCronService{
			UpdateCronProductCategoryFunc: func(
				context.Context,
				string,
				*contracts.UpdateCronProductCategoryRequest,
			) (*contracts.UpdateCronProductCategoryResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		err := handler.UpdateCronProductCategory(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func (m *MockCronService) CreateCronProduct(ctx context.Context, request *contracts.CreateCronProductRequest) (*contracts.CreateCronProductResponse, error) {
	if m.CreateCronProductFunc != nil {
		return m.CreateCronProductFunc(ctx, request)
	}
	return &contracts.CreateCronProductResponse{}, nil
}

func (m *MockCronService) GetAllCronProducts(ctx context.Context) (*contracts.GetAllCronProductsResponse, error) {
	if m.GetAllCronProductsFunc != nil {
		return m.GetAllCronProductsFunc(ctx)
	}
	return &contracts.GetAllCronProductsResponse{}, nil
}

func (m *MockCronService) DeleteCronProduct(ctx context.Context, id string) (*contracts.DeleteCronProductResponse, error) {
	if m.DeleteCronProductFunc != nil {
		return m.DeleteCronProductFunc(ctx, id)
	}
	return &contracts.DeleteCronProductResponse{}, nil
}

func (m *MockCronService) GetCronProductsByUser(ctx context.Context, user string) (*contracts.GetCronProductsByUserResponse, error) {
	if m.GetCronProductsByUserFunc != nil {
		return m.GetCronProductsByUserFunc(ctx, user)
	}
	return &contracts.GetCronProductsByUserResponse{}, nil
}

func (m *MockCronService) UpdateCronProductCategory(ctx context.Context, id string, request *contracts.UpdateCronProductCategoryRequest) (*contracts.UpdateCronProductCategoryResponse, error) {
	if m.UpdateCronProductCategoryFunc != nil {
		return m.UpdateCronProductCategoryFunc(ctx, id, request)
	}
	return &contracts.UpdateCronProductCategoryResponse{}, nil
}

func newHandler(mock *MockCronService) *CronHandler {
	return NewCronHandler(mock)
}
