package services

import (
	"context"
	"encoding/json"
	"errors"
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

		req := &contracts.UploadImageRequest{
			Image: tests.MockTestFileHeader(t),
		}

		// when
		res, err := service.UploadRecipeImage(context.Background(), "recipe1", req)

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

		req := &contracts.UploadImageRequest{
			Image: tests.MockTestFileHeader(t),
		}

		// when
		res, err := service.UploadRecipeImage(context.Background(), "recipe1", req)

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

		req := &contracts.UploadImageRequest{
			Image: tests.MockTestFileHeader(t),
		}

		// when
		res, err := service.UploadRecipeImage(context.Background(), "recipe1", req)

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

		req := &contracts.UploadImageRequest{
			Image: tests.MockTestFileHeader(t),
		}

		// when
		res, err := service.UploadListImage(context.Background(), "list1", req)

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

		req := &contracts.UploadImageRequest{
			Image: tests.MockTestFileHeader(t),
		}

		// when
		res, err := service.UploadListImage(context.Background(), "list1", req)

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

		req := &contracts.UploadImageRequest{
			Image: tests.MockTestFileHeader(t),
		}

		// when
		res, err := service.UploadListImage(context.Background(), "list1", req)

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
