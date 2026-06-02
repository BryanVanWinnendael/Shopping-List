package services

import (
	"bytes"
	"image"
	"image/color"
	"image/jpeg"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"shopping-list/shared/contracts"
	"testing"

	"shopping-list/storage/internal/config"

	"github.com/labstack/echo/v4"
)

func TestUploadRecipeImage(t *testing.T) {
	t.Run("Given valid image, When UploadRecipeImage, Then returns URLs", func(t *testing.T) {
		// given
		dir := t.TempDir()
		config.Vars.StorageDir = dir
		config.Vars.Host = "http://localhost"

		service := NewStorageService()

		req, _ := createMultipartRequest(t)
		e := echo.New()
		c := e.NewContext(req, httptest.NewRecorder())

		fh, err := c.FormFile("image")
		if err != nil {
			t.Fatalf("failed to get file: %v", err)
		}
		request := contracts.UploadImageRequest{
			Image: fh,
		}

		// when
		result, err := service.UploadRecipeImage(&request, "recipe1")

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.Small == "" || result.Large == "" {
			t.Fatalf("expected urls")
		}
	})
}

func TestUploadListImage(t *testing.T) {
	t.Run("Given valid image, When UploadListImage, Then returns URLs", func(t *testing.T) {
		// given
		dir := t.TempDir()
		config.Vars.StorageDir = dir
		config.Vars.Host = "http://localhost"

		service := NewStorageService()

		req, _ := createMultipartRequest(t)
		e := echo.New()
		c := e.NewContext(req, httptest.NewRecorder())

		fh, err := c.FormFile("image")
		if err != nil {
			t.Fatalf("failed to get file: %v", err)
		}
		request := contracts.UploadImageRequest{
			Image: fh,
		}

		// when
		result, err := service.UploadListImage(&request, "list1")

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.Small == "" || result.Large == "" {
			t.Fatalf("expected urls")
		}
	})
}

func TestDeleteStorage(t *testing.T) {
	t.Run("Given existing folder, When DeleteStorage, Then remove storage", func(t *testing.T) {
		// given
		dir := t.TempDir()
		config.Vars.StorageDir = dir

		path := filepath.Join(dir, "recipes", "images", "1")
		_ = os.MkdirAll(path, 0755)

		service := NewStorageService()

		// when
		result, err := service.DeleteStorage("1", "recipes")

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if _, err := os.Stat(path); !os.IsNotExist(err) {
			t.Fatalf("expected directory removed")
		}

		if result.Message != "storage deleted successfully" {
			t.Fatalf("expected storage deleted successfully got %s", result.Message)
		}
	})

	t.Run("Given missing folder, When DeleteStorage, Then returns error", func(t *testing.T) {
		// given
		dir := t.TempDir()
		config.Vars.StorageDir = dir

		service := NewStorageService()

		// when
		result, _ := service.DeleteStorage("missing", "recipes")

		// then
		if result.Message != "storage not found" {
			t.Fatalf("expected storage not found got %s", result.Message)
		}
	})
}

func TestDeleteRecipeImage(t *testing.T) {
	t.Run("Given external URL, When DeleteRecipeImage, Then returns error", func(t *testing.T) {
		// given
		dir := t.TempDir()
		config.Vars.StorageDir = dir
		config.Vars.Host = "http://localhost"

		service := NewStorageService()

		// when
		_, err := service.DeleteRecipeImage("1", "http://evil.com/image.jpg")

		// then
		if err == nil {
			t.Fatalf("expected error")
		}
	})

	t.Run("Given valid internal URL, When DeleteRecipeImage, Then deletes file successfully", func(t *testing.T) {
		// given
		dir := t.TempDir()
		config.Vars.StorageDir = dir
		config.Vars.Host = "http://localhost"

		service := NewStorageService()

		itemID := "1"
		category := "recipes"

		baseDir := filepath.Join(dir, category, "images", itemID)
		_ = os.MkdirAll(baseDir, 0755)

		filePath := filepath.Join(baseDir, "large-test.jpg")
		_ = os.WriteFile(filePath, []byte("fake"), 0644)

		url := "http://localhost/recipes/images/1/large-test.jpg"

		// when
		result, err := service.DeleteRecipeImage(itemID, url)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if _, err := os.Stat(filePath); !os.IsNotExist(err) {
			t.Fatalf("expected file to be deleted")
		}

		if result.Message != "recipe image deleted successfully" {
			t.Fatalf("expected recipe image deleted successfully got %s", result.Message)
		}
	})

	t.Run("Given URL without host prefix, When DeleteRecipeImage, Then returns invalid URL error", func(t *testing.T) {
		// given
		dir := t.TempDir()
		config.Vars.StorageDir = dir
		config.Vars.Host = "http://localhost"

		service := NewStorageService()

		// when
		_, err := service.DeleteRecipeImage("1", "/recipes/images/1/large.jpg")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})

	t.Run("Given wrong host prefix, When DeleteRecipeImage, Then returns invalid URL error", func(t *testing.T) {
		// given
		dir := t.TempDir()
		config.Vars.StorageDir = dir
		config.Vars.Host = "http://localhost"

		service := NewStorageService()

		// when
		_, err := service.DeleteRecipeImage("1", "http://evilhost/recipes/images/1/large.jpg")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})

	t.Run("Given file not existing, When DeleteRecipeImage, Then returns file not found error", func(t *testing.T) {
		// given
		dir := t.TempDir()
		config.Vars.StorageDir = dir
		config.Vars.Host = "http://localhost"

		service := NewStorageService()

		url := "http://localhost/recipes/images/1/large-missing.jpg"

		// when
		_, err := service.DeleteRecipeImage("1", url)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func createTestImage(t *testing.T) []byte {
	img := image.NewRGBA(image.Rect(0, 0, 100, 100))
	img.Set(10, 10, color.RGBA{R: 255, A: 255})

	var buf bytes.Buffer
	if err := jpeg.Encode(&buf, img, nil); err != nil {
		t.Fatalf("failed to encode image: %v", err)
	}

	return buf.Bytes()
}

func createMultipartRequest(t *testing.T) (*http.Request, string) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("image", "test.jpg")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}

	_, err = part.Write(createTestImage(t))
	if err != nil {
		t.Fatalf("failed to write image: %v", err)
	}

	if err := writer.Close(); err != nil {
		t.Fatalf("failed to close writer: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/upload", body)
	req.Header.Set(echo.HeaderContentType, writer.FormDataContentType())

	return req, writer.FormDataContentType()
}
