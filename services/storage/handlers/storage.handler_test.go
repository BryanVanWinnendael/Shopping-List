package handlers

import (
	"encoding/json"
	"errors"
	"mime/multipart"
	"net/http"
	"shopping-list/shared/tests"
	"testing"

	"shopping-list/storage/internal/config"
	"shopping-list/storage/models"
)

type MockStorageService struct {
	SaveRecipesFunc func(*multipart.FileHeader, string) (string, string, error)
	SaveListFunc    func(*multipart.FileHeader, string) (string, string, error)
	DeleteImageFunc func(string, string) error
	DeleteFunc      func(string, string) error
}

func TestUploadRecipesImage(t *testing.T) {
	t.Run("Given missing file, When UploadRecipesImage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/recipes/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.UploadRecipesImage(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given missing id, When UploadRecipesImage, Then returns 400", func(t *testing.T) {
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
		_ = handler.UploadRecipesImage(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When UploadRecipesImage, Then returns 500", func(t *testing.T) {
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
			SaveRecipesFunc: func(f *multipart.FileHeader, id string) (string, string, error) {
				return "", "", errors.New("fail")
			},
		})

		// when
		_ = handler.UploadRecipesImage(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When UploadRecipesImage, Then returns 200", func(t *testing.T) {
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
			SaveRecipesFunc: func(f *multipart.FileHeader, id string) (string, string, error) {
				return "/small.jpg", "/large.jpg", nil
			},
		})

		// when
		_ = handler.UploadRecipesImage(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestDeleteRecipesImage(t *testing.T) {
	t.Run("Given missing id, When DeleteRecipesImage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes", nil)

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteRecipesImage(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given external url, When DeleteRecipesImage, Then returns 200", func(t *testing.T) {
		// given
		config.Vars.Host = "http://localhost"

		body, _ := json.Marshal(models.DeleteImageRequest{
			URL: "http://external.com/image.jpg",
		})

		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteRecipesImage(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteRecipesImage, Then returns 500", func(t *testing.T) {
		// given
		config.Vars.Host = "http://localhost"

		body, _ := json.Marshal(models.DeleteImageRequest{
			URL: "http://localhost/image.jpg",
		})

		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{
			DeleteImageFunc: func(id, url string) error {
				return errors.New("fail")
			},
		})

		// when
		_ = handler.DeleteRecipesImage(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestDeleteRecipesStorage(t *testing.T) {
	t.Run("Given missing id, When DeleteRecipesStorage, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes", nil)

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteRecipesStorage(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteRecipesStorage, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{
			DeleteFunc: func(id, cat string) error {
				return errors.New("fail")
			},
		})

		// when
		_ = handler.DeleteRecipesStorage(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When DeleteRecipesStorage, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteRecipesStorage(c)

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

		handler := NewStorageHandler(&MockStorageService{
			DeleteFunc: func(id, cat string) error {
				return nil
			},
		})

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
			DeleteFunc: func(id, cat string) error {
				return errors.New("fail")
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

func TestUploadListImage_Coverage(t *testing.T) {
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

		handler := NewStorageHandler(&MockStorageService{
			SaveListFunc: func(f *multipart.FileHeader, id string) (string, string, error) {
				return "/small.jpg", "/large.jpg", nil
			},
		})

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

func TestDeleteRecipesImage_Success(t *testing.T) {
	t.Run("Given valid internal url and service success, When DeleteRecipesImage, Then returns 200 success message", func(t *testing.T) {
		// given
		config.Vars.Host = "http://localhost"

		body, _ := json.Marshal(models.DeleteImageRequest{
			URL: "http://localhost/storage/recipes/images/1/large.jpg",
		})

		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{
			DeleteImageFunc: func(id, url string) error {
				return nil
			},
		})

		// when
		_ = handler.DeleteRecipesImage(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}

		var resp map[string]string
		_ = json.Unmarshal(rec.Body.Bytes(), &resp)

		expected := "Image for recipes 1 deleted successfully"
		if resp["message"] != expected {
			t.Fatalf("expected message %q, got %q", expected, resp["message"])
		}
	})
}

func TestDeleteImage(t *testing.T) {
	t.Run("Given invalid JSON body, When DeleteRecipesImage, Then returns 400 invalid request body", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", []byte("{invalid-json"))
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := NewStorageHandler(&MockStorageService{})

		// when
		_ = handler.DeleteRecipesImage(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})
}

func (m *MockStorageService) SaveRecipesImage(f *multipart.FileHeader, id string) (string, string, error) {
	if m.SaveRecipesFunc != nil {
		return m.SaveRecipesFunc(f, id)
	}
	return "/small.jpg", "/large.jpg", nil
}

func (m *MockStorageService) SaveListImage(f *multipart.FileHeader, id string) (string, string, error) {
	if m.SaveListFunc != nil {
		return m.SaveListFunc(f, id)
	}
	return "/small.jpg", "/large.jpg", nil
}

func (m *MockStorageService) DeleteRecipesImage(id, url string) error {
	if m.DeleteImageFunc != nil {
		return m.DeleteImageFunc(id, url)
	}
	return nil
}

func (m *MockStorageService) DeleteStorage(id, category string) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(id, category)
	}
	return nil
}
