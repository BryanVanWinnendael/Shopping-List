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

type MockCategoryModelService struct {
	TrainModelFunc     func(ctx context.Context) (*contracts.TrainModelResponse, error)
	GetCategoryFunc    func(ctx context.Context, product string) (*contracts.GetCategoryResponse, error)
	CreateCategoryFunc func(ctx context.Context, request *contracts.CreateCategoryRequest) (*contracts.CreateCategoryResponse, error)
}

func TestTrainModel(t *testing.T) {
	t.Run("Given service success, When TrainModel, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/model/train", nil)

		handler := newCategoryModelHandler(&MockCategoryModelService{})

		// when
		err := handler.TrainModel(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When TrainModel, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/model/train", nil)

		handler := newCategoryModelHandler(&MockCategoryModelService{
			TrainModelFunc: func(context.Context) (*contracts.TrainModelResponse, error) {
				return nil, errors.New("training failed")
			},
		})

		// when
		err := handler.TrainModel(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetCategory(t *testing.T) {
	t.Run("Given missing product query param, When GetCategory, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/model/category", nil)

		handler := newCategoryModelHandler(&MockCategoryModelService{})

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

	t.Run("Given valid product, When GetCategory, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/model/category?product=milk", nil)

		handler := newCategoryModelHandler(&MockCategoryModelService{})

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
		c, rec := tests.SetupEcho(http.MethodGet, "/model/category?product=milk", nil)

		handler := newCategoryModelHandler(&MockCategoryModelService{
			GetCategoryFunc: func(context.Context, string) (*contracts.GetCategoryResponse, error) {
				return nil, errors.New("prediction failed")
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
	t.Run("Given invalid body, When CreateCategory, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/model/category", []byte("invalid-json"))

		handler := newCategoryModelHandler(&MockCategoryModelService{})

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
		body, _ := json.Marshal(contracts.CreateCategoryRequest{})

		c, rec := tests.SetupEcho(http.MethodPost, "/model/category", body)

		handler := newCategoryModelHandler(&MockCategoryModelService{})

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
		body, _ := json.Marshal(contracts.CreateCategoryRequest{
			Product:  "milk",
			Category: "dairy",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/model/category", body)

		handler := newCategoryModelHandler(&MockCategoryModelService{})

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
		body, _ := json.Marshal(contracts.CreateCategoryRequest{
			Product:  "milk",
			Category: "dairy",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/model/category", body)

		handler := newCategoryModelHandler(&MockCategoryModelService{
			CreateCategoryFunc: func(context.Context, *contracts.CreateCategoryRequest) (*contracts.CreateCategoryResponse, error) {
				return nil, errors.New("insert failed")
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

func (m *MockCategoryModelService) TrainModel(ctx context.Context) (*contracts.TrainModelResponse, error) {
	if m.TrainModelFunc != nil {
		return m.TrainModelFunc(ctx)
	}

	return &contracts.TrainModelResponse{}, nil
}

func (m *MockCategoryModelService) GetCategory(ctx context.Context, product string) (*contracts.GetCategoryResponse, error) {
	if m.GetCategoryFunc != nil {
		return m.GetCategoryFunc(ctx, product)
	}

	return &contracts.GetCategoryResponse{}, nil
}

func (m *MockCategoryModelService) CreateCategory(ctx context.Context, request *contracts.CreateCategoryRequest) (*contracts.CreateCategoryResponse, error) {
	if m.CreateCategoryFunc != nil {
		return m.CreateCategoryFunc(ctx, request)
	}

	return &contracts.CreateCategoryResponse{}, nil
}

func newCategoryModelHandler(mock *MockCategoryModelService) *CategoryModelHandler {
	return NewCategoryModelHandler(mock)
}
