package services

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"testing"

	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
)

func TestUploadRecipeImage(t *testing.T) {
	t.Run("Given valid request, When UploadRecipeImage, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UploadImageResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewStorageService(client, "http://test")

		fileHeader := tests.MockTestFileHeader(t)

		// when
		res, err := service.UploadRecipeImage(context.Background(), "recipe1", fileHeader)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given multipart client fails, When UploadRecipeImage, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewStorageService(client, "http://test")

		fileHeader := tests.MockTestFileHeader(t)

		// when
		res, err := service.UploadRecipeImage(context.Background(), "recipe1", fileHeader)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When UploadRecipeImage, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UploadImageResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewStorageService(client, "http://test")

		fileHeader := tests.MockTestFileHeader(t)

		// when
		res, err := service.UploadRecipeImage(context.Background(), "recipe1", fileHeader)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestDeleteRecipeImage(t *testing.T) {
	t.Run("Given valid request, When DeleteRecipeImage, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteImageResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewStorageService(client, "http://test")

		req := &contracts.DeleteImageRequest{}

		// when
		res, err := service.DeleteRecipeImage(context.Background(), "recipe1", req)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When DeleteRecipeImage, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewStorageService(client, "http://test")

		req := &contracts.DeleteImageRequest{}

		// when
		res, err := service.DeleteRecipeImage(context.Background(), "recipe1", req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When DeleteRecipeImage, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteImageResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewStorageService(client, "http://test")

		req := &contracts.DeleteImageRequest{}

		// when
		res, err := service.DeleteRecipeImage(context.Background(), "recipe1", req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestDeleteRecipeStorage(t *testing.T) {
	t.Run("Given valid request, When DeleteRecipeStorage, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteStorageResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewStorageService(client, "http://test")

		// when
		res, err := service.DeleteRecipeStorage(context.Background(), "recipe1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When DeleteRecipeStorage, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewStorageService(client, "http://test")

		// when
		res, err := service.DeleteRecipeStorage(context.Background(), "recipe1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When DeleteRecipeStorage, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteStorageResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewStorageService(client, "http://test")

		// when
		res, err := service.DeleteRecipeStorage(context.Background(), "recipe1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestUploadListImage(t *testing.T) {
	t.Run("Given valid request, When UploadListImage, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UploadImageResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewStorageService(client, "http://test")

		fileHeader := tests.MockTestFileHeader(t)

		// when
		res, err := service.UploadListImage(context.Background(), "list1", fileHeader)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given multipart client fails, When UploadListImage, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewStorageService(client, "http://test")

		fileHeader := tests.MockTestFileHeader(t)

		// when
		res, err := service.UploadListImage(context.Background(), "list1", fileHeader)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When UploadListImage, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UploadImageResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewStorageService(client, "http://test")

		fileHeader := tests.MockTestFileHeader(t)

		// when
		res, err := service.UploadListImage(context.Background(), "list1", fileHeader)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestDeleteListImage(t *testing.T) {
	t.Run("Given valid request, When DeleteListImage, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteImageResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewStorageService(client, "http://test")

		// when
		res, err := service.DeleteListImage(context.Background(), "list1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When DeleteListImage, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewStorageService(client, "http://test")

		// when
		res, err := service.DeleteListImage(context.Background(), "list1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When DeleteListImage, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteImageResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewStorageService(client, "http://test")

		// when
		res, err := service.DeleteListImage(context.Background(), "list1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestGetStorageBackup(t *testing.T) {
	t.Run("Given valid request, When GetBackup, Then success", func(t *testing.T) {
		// given
		expectedBody := []byte("fake-binary-db-content")

		client := tests.MockRawResponse(200, expectedBody, map[string]string{
			"Content-Type":        "application/octet-stream",
			"Content-Disposition": `attachment; filename="backup.db"`,
		})

		service := NewStorageService(client, "http://test")

		// when
		res, err := service.GetBackup(context.Background())

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if res == nil {
			t.Fatalf("expected response, got nil")
		}

		defer func(Body io.ReadCloser) {
			err := Body.Close()
			if err != nil {
				t.Fatalf("failed to close response body: %v", err)
			}
		}(res.Body)

		body, err := io.ReadAll(res.Body)
		if err != nil {
			t.Fatalf("failed to read body: %v", err)
		}

		if string(body) != string(expectedBody) {
			t.Fatalf("expected %s, got %s", expectedBody, body)
		}

		if res.Header.Get("Content-Type") != "application/octet-stream" {
			t.Fatalf("expected content-type application/octet-stream, got %s", res.Header.Get("Content-Type"))
		}
	})

	t.Run("Given http client fails, When GetBackup, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewStorageService(client, "http://test")

		// when
		res, err := service.GetBackup(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error, When GetBackup, Then return error", func(t *testing.T) {
		// given
		client := tests.MockRawResponse(500, []byte("internal error"), nil)

		service := NewStorageService(client, "http://test")

		// when
		res, err := service.GetBackup(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}
