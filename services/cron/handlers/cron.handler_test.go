package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
	"testing"
)

type MockCronService struct {
	CreateCronProductFunc         func(request *contracts.CreateCronProductRequest) (*contracts.CreateCronProductResponse, error)
	GetAllCronProductsFunc        func() (*contracts.GetAllCronProductsResponse, error)
	UpdateCronProductCategoryFunc func(id string, request *contracts.UpdateCronProductCategoryRequest) (*contracts.UpdateCronProductCategoryResponse, error)
	DeleteCronProductFunc         func(id string) (*contracts.DeleteCronProductResponse, error)
	GetCronProductsByUserFunc     func(user string) (*contracts.GetCronProductsByUserResponse, error)
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

	t.Run("Given valid request, When CreateCronProduct, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateCronProductRequest{
			Product:  "test",
			Category: "work",
			User:     "user1",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/cron", body)

		handler := NewCronHandler(&MockCronService{})

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
			Category: "test",
			User:     "test",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/cron", body)

		handler := NewCronHandler(&MockCronService{
			CreateCronProductFunc: func(*contracts.CreateCronProductRequest) (*contracts.CreateCronProductResponse, error) {
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
	t.Run("Given service success, When GetAllCronProducts, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/cron", nil)

		handler := NewCronHandler(&MockCronService{})

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

		handler := NewCronHandler(&MockCronService{
			GetAllCronProductsFunc: func() (*contracts.GetAllCronProductsResponse, error) {
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

func TestUpdateCronProductCategory(t *testing.T) {
	t.Run("Given empty category, When UpdateCronProductCategory, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateCronProductCategoryRequest{
			Category: "",
		})

		c, rec := tests.SetupEcho(http.MethodPut, "/cron/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewCronHandler(&MockCronService{})

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

		handler := NewCronHandler(&MockCronService{})

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

	t.Run("Given invalid body, When UpdateCronProductCategory, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPut, "/cron/1", []byte("invalid-json"))
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewCronHandler(&MockCronService{})

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

	t.Run("Given service error, When UpdateCronProductCategory, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateCronProductCategoryRequest{
			Category: "new",
		})

		c, rec := tests.SetupEcho(http.MethodPut, "/cron/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewCronHandler(&MockCronService{
			UpdateCronProductCategoryFunc: func(string, *contracts.UpdateCronProductCategoryRequest) (*contracts.UpdateCronProductCategoryResponse, error) {
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

func TestDeleteCronProduct(t *testing.T) {
	t.Run("Given valid id, When DeleteCronProduct, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/cron/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewCronHandler(&MockCronService{})

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

		handler := NewCronHandler(&MockCronService{
			DeleteCronProductFunc: func(string) (*contracts.DeleteCronProductResponse, error) {
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
	t.Run("Given valid name, When GetCronProductsByUser, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/cron/user1", nil)
		c.SetParamNames("name")
		c.SetParamValues("user1")

		handler := NewCronHandler(&MockCronService{})

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
		c.SetParamNames("name")
		c.SetParamValues("user1")

		handler := NewCronHandler(&MockCronService{
			GetCronProductsByUserFunc: func(string) (*contracts.GetCronProductsByUserResponse, error) {
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

func (m *MockCronService) CreateCronProduct(Product *contracts.CreateCronProductRequest) (*contracts.CreateCronProductResponse, error) {
	if m.CreateCronProductFunc != nil {
		return m.CreateCronProductFunc(Product)
	}
	return &contracts.CreateCronProductResponse{
		Product:  "mock-Product",
		Category: "mock-category",
		Id:       "mock-id",
	}, nil
}

func (m *MockCronService) GetAllCronProducts() (*contracts.GetAllCronProductsResponse, error) {
	if m.GetAllCronProductsFunc != nil {
		return m.GetAllCronProductsFunc()
	}
	result := contracts.GetAllCronProductsResponse{
		{
			Product:  "mock-Product",
			Category: "mock-category",
		},
		{
			Product:  "mock-Product2",
			Category: "mock-category2",
		},
	}

	return &result, nil
}

func (m *MockCronService) UpdateCronProductCategory(id string, request *contracts.UpdateCronProductCategoryRequest) (*contracts.UpdateCronProductCategoryResponse, error) {
	if m.UpdateCronProductCategoryFunc != nil {
		return m.UpdateCronProductCategoryFunc(id, request)
	}
	return &contracts.UpdateCronProductCategoryResponse{
		Id:       id,
		Category: request.Category,
		User:     "mock-user",
		Product:  "mock-Product",
	}, nil
}

func (m *MockCronService) DeleteCronProduct(id string) (*contracts.DeleteCronProductResponse, error) {
	if m.DeleteCronProductFunc != nil {
		return m.DeleteCronProductFunc(id)
	}
	return &contracts.DeleteCronProductResponse{
		Id:      id,
		Message: "Deleted cron-Product",
	}, nil
}

func (m *MockCronService) GetCronProductsByUser(user string) (*contracts.GetCronProductsByUserResponse, error) {
	if m.GetCronProductsByUserFunc != nil {
		return m.GetCronProductsByUserFunc(user)
	}
	result := contracts.GetCronProductsByUserResponse{
		{
			Product:  "mock-Product",
			Category: "mock-category",
		},
		{
			Product:  "mock-Product2",
			Category: "mock-category2",
		},
	}

	return &result, nil
}
