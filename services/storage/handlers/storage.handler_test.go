package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
	"shopping-list/storage/internal/config"
	"testing"
)

type MockStorageService struct {
	UploadRecipeImageFunc func(request *contracts.UploadImageRequest, recipeID string) (*contracts.UploadImageResponse, error)
	UploadListImageFunc   func(request *contracts.UploadImageRequest, recipeID string) (*contracts.UploadImageResponse, error)
	DeleteRecipeImageFunc func(recipeID string, url string) (*contracts.DeleteRecipeResponse, error)
	DeleteStorageFunc     func(itemID string, category string) (*contracts.DeleteStorageResponse, error)
}

func TestUploadRecipeImage(t *testing.T) {
	t.Run("Given missing file, When UploadRecipeImage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/recipes/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.UploadRecipeImage(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given missing id, When UploadRecipeImage, Then returns 400", func(t *testing.T) {
		// given
		files := []tests.MultipartFile{
			{
				FieldName: "image",
				FileName:  "test.jpg",
				Content:   []byte("fake-image"),
			},
		}
		c, rec := tests.SetupMultipartEcho(t, http.MethodPost, "/recipes", files, nil)
		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.UploadRecipeImage(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When UploadRecipeImage, Then returns 500", func(t *testing.T) {
		// given
		files := []tests.MultipartFile{
			{
				FieldName: "image",
				FileName:  "test.jpg",
				Content:   []byte("fake-image"),
			},
		}
		c, rec := tests.SetupMultipartEcho(t, http.MethodPost, "/recipes/1", files, nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{
			UploadRecipeImageFunc: func(*contracts.UploadImageRequest, string) (*contracts.UploadImageResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.UploadRecipeImage(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When UploadRecipeImage, Then returns 200", func(t *testing.T) {
		// given
		files := []tests.MultipartFile{
			{
				FieldName: "image",
				FileName:  "test.jpg",
				Content:   []byte("fake-image"),
			},
		}
		c, rec := tests.SetupMultipartEcho(t, http.MethodPost, "/recipes/1", files, nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.UploadRecipeImage(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestDeleteRecipeImage(t *testing.T) {
	t.Run("Given missing id, When DeleteRecipeImage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes", nil)

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteRecipeImage(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given external url, When DeleteRecipeImage, Then returns 200", func(t *testing.T) {
		// given
		config.Vars.Host = "http://localhost"

		body, _ := json.Marshal(contracts.DeleteImageRequest{
			URL: "http://external.com/image.jpg",
		})

		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteRecipeImage(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteRecipeImage, Then returns 500", func(t *testing.T) {
		// given
		config.Vars.Host = "http://localhost"

		body, _ := json.Marshal(contracts.DeleteImageRequest{
			URL: "http://localhost/image.jpg",
		})

		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{
			DeleteRecipeImageFunc: func(string, string) (*contracts.DeleteRecipeResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.DeleteRecipeImage(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid internal url and service success, When DeleteRecipeImage, Then returns 200 success message", func(t *testing.T) {
		// given
		config.Vars.Host = "http://localhost"

		body, _ := json.Marshal(contracts.DeleteImageRequest{
			URL: "http://localhost/storage/recipes/images/1/large.jpg",
		})

		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteRecipeImage(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}

		var resp map[string]string
		_ = json.Unmarshal(rec.Body.Bytes(), &resp)

		expected := "Recipe image deleted"
		if resp["message"] != expected {
			t.Fatalf("expected message %q, got %q", expected, resp["message"])
		}
	})

	t.Run("Given invalid JSON body, When DeleteRecipeImage, Then returns 400 invalid request body", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", []byte("{invalid-json"))
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteRecipeImage(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})
}

func TestDeleteRecipeStorage(t *testing.T) {
	t.Run("Given missing id, When DeleteRecipeStorage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes", nil)

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteRecipeStorage(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteRecipeStorage, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{
			DeleteStorageFunc: func(string, string) (*contracts.DeleteStorageResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.DeleteRecipeStorage(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When DeleteRecipeStorage, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteRecipeStorage(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestDeleteListImage(t *testing.T) {
	t.Run("Given missing id, When DeleteListImage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/list", nil)

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteListImage(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When DeleteListImage, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/list/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteListImage(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteListImage, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/list/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{
			DeleteStorageFunc: func(string, string) (*contracts.DeleteStorageResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.DeleteListImage(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestUploadListImage(t *testing.T) {
	t.Run("Given valid request, When UploadListImage, Then returns 200", func(t *testing.T) {
		// given
		files := []tests.MultipartFile{
			{
				FieldName: "image",
				FileName:  "test.jpg",
				Content:   []byte("fake-image"),
			},
		}
		c, rec := tests.SetupMultipartEcho(t, http.MethodPost, "/list/1", files, nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		err := handler.UploadListImage(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func (m *MockStorageService) UploadRecipeImage(request *contracts.UploadImageRequest, recipeID string) (*contracts.UploadImageResponse, error) {
	if m.UploadRecipeImageFunc != nil {
		return m.UploadRecipeImageFunc(request, recipeID)
	}
	return &contracts.UploadImageResponse{
		Large: "/large.jpg",
		Small: "/small.jpg",
	}, nil
}

func (m *MockStorageService) UploadListImage(request *contracts.UploadImageRequest, recipeID string) (*contracts.UploadImageResponse, error) {
	if m.UploadListImageFunc != nil {
		return m.UploadListImageFunc(request, recipeID)
	}
	return &contracts.UploadImageResponse{
		Large: "/large.jpg",
		Small: "/small.jpg",
	}, nil
}

func (m *MockStorageService) DeleteRecipeImage(recipeID string, url string) (*contracts.DeleteRecipeResponse, error) {
	if m.DeleteRecipeImageFunc != nil {
		return m.DeleteRecipeImageFunc(recipeID, url)
	}
	return &contracts.DeleteRecipeResponse{
		Id:      recipeID,
		Message: "Recipe image deleted",
	}, nil
}

func (m *MockStorageService) DeleteStorage(itemID string, category string) (*contracts.DeleteStorageResponse, error) {
	if m.DeleteStorageFunc != nil {
		return m.DeleteStorageFunc(itemID, category)
	}
	return &contracts.DeleteStorageResponse{
		Id:      itemID,
		Message: "Storage deleted",
	}, nil
}
