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

type MockStorageService struct {
	UploadRecipeImageFunc   func(ctx context.Context, id string, req *contracts.UploadImageRequest) (*contracts.UploadImageResponse, error)
	DeleteRecipeImageFunc   func(ctx context.Context, id string, req *contracts.DeleteImageRequest) (*contracts.DeleteImageResponse, error)
	DeleteRecipeStorageFunc func(ctx context.Context, id string) (*contracts.DeleteStorageResponse, error)
	UploadListImageFunc     func(ctx context.Context, id string, req *contracts.UploadImageRequest) (*contracts.UploadImageResponse, error)
	DeleteListImageFunc     func(ctx context.Context, id string) (*contracts.DeleteImageResponse, error)
}

func TestUploadRecipeImage(t *testing.T) {
	t.Run("Given missing id, When UploadRecipeImage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/storage/recipe", nil)

		handler := NewStorageHandler(&MockStorageService{})

		// when
		err := handler.UploadRecipeImage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given missing image file, When UploadRecipeImage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/storage/recipe/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		err := handler.UploadRecipeImage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})
}

func TestDeleteRecipeImage(t *testing.T) {
	t.Run("Given missing id, When DeleteRecipeImage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/storage/recipe", nil)

		handler := NewStorageHandler(&MockStorageService{})

		// when
		err := handler.DeleteRecipeImage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given invalid body, When DeleteRecipeImage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/storage/recipe/1", []byte("bad-json"))
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		err := handler.DeleteRecipeImage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When DeleteRecipeImage, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteImageRequest{
			URL: "https://www.test.com",
		})

		c, rec := tests.SetupEcho(http.MethodDelete, "/storage/recipe/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		err := handler.DeleteRecipeImage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteRecipeImage, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteImageRequest{
			URL: "https://www.test.com",
		})

		c, rec := tests.SetupEcho(http.MethodDelete, "/storage/recipe/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{
			DeleteRecipeImageFunc: func(context.Context, string, *contracts.DeleteImageRequest) (*contracts.DeleteImageResponse, error) {
				return nil, errors.New("delete failed")
			},
		})

		// when
		err := handler.DeleteRecipeImage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestDeleteRecipeStorage(t *testing.T) {
	t.Run("Given missing id, When DeleteRecipeStorage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/storage/recipe", nil)

		handler := NewStorageHandler(&MockStorageService{})

		// when
		err := handler.DeleteRecipeStorage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service success, When DeleteRecipeStorage, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/storage/recipe/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		err := handler.DeleteRecipeStorage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteRecipeStorage, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/storage/recipe/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{
			DeleteRecipeStorageFunc: func(context.Context, string) (*contracts.DeleteStorageResponse, error) {
				return nil, errors.New("failed")
			},
		})

		// when
		err := handler.DeleteRecipeStorage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestUploadListImage(t *testing.T) {
	t.Run("Given missing id, When UploadListImage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/storage/list", nil)

		handler := NewStorageHandler(&MockStorageService{})

		// when
		err := handler.UploadListImage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given missing image, When UploadListImage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/storage/list/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.UploadListImage(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})
}

func TestDeleteListImage(t *testing.T) {
	t.Run("Given missing id, When DeleteListImage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/storage/list", nil)

		handler := NewStorageHandler(&MockStorageService{})

		// when
		err := handler.DeleteListImage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When DeleteListImage, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/storage/list/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		err := handler.DeleteListImage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteListImage, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/storage/list/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{
			DeleteListImageFunc: func(context.Context, string) (*contracts.DeleteImageResponse, error) {
				return nil, errors.New("failed")
			},
		})

		// when
		err := handler.DeleteListImage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func (m *MockStorageService) UploadRecipeImage(ctx context.Context, id string, req *contracts.UploadImageRequest) (*contracts.UploadImageResponse, error) {
	if m.UploadRecipeImageFunc != nil {
		return m.UploadRecipeImageFunc(ctx, id, req)
	}
	return &contracts.UploadImageResponse{}, nil
}

func (m *MockStorageService) DeleteRecipeImage(ctx context.Context, id string, req *contracts.DeleteImageRequest) (*contracts.DeleteImageResponse, error) {
	if m.DeleteRecipeImageFunc != nil {
		return m.DeleteRecipeImageFunc(ctx, id, req)
	}
	return &contracts.DeleteImageResponse{}, nil
}

func (m *MockStorageService) DeleteRecipeStorage(ctx context.Context, id string) (*contracts.DeleteStorageResponse, error) {
	if m.DeleteRecipeStorageFunc != nil {
		return m.DeleteRecipeStorageFunc(ctx, id)
	}
	return &contracts.DeleteStorageResponse{}, nil
}

func (m *MockStorageService) UploadListImage(ctx context.Context, id string, req *contracts.UploadImageRequest) (*contracts.UploadImageResponse, error) {
	if m.UploadListImageFunc != nil {
		return m.UploadListImageFunc(ctx, id, req)
	}
	return &contracts.UploadImageResponse{}, nil
}

func (m *MockStorageService) DeleteListImage(ctx context.Context, id string) (*contracts.DeleteImageResponse, error) {
	if m.DeleteListImageFunc != nil {
		return m.DeleteListImageFunc(ctx, id)
	}
	return &contracts.DeleteImageResponse{}, nil
}
