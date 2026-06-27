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

func TestTrainModel(t *testing.T) {
	t.Run("Given valid request, When TrainModel, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.TrainModelResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewCategoryModelService(client, "http://test")

		// when
		res, err := service.TrainModel(context.Background())

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When TrainModel, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewCategoryModelService(client, "http://test")

		// when
		res, err := service.TrainModel(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When TrainModel, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.TrainModelResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewCategoryModelService(client, "http://test")

		// when
		res, err := service.TrainModel(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestGetCategory(t *testing.T) {
	t.Run("Given valid request, When GetCategory, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetCategoryResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewCategoryModelService(client, "http://test")

		// when
		res, err := service.GetCategory(context.Background(), "milk")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When GetCategory, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewCategoryModelService(client, "http://test")

		// when
		res, err := service.GetCategory(context.Background(), "milk")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When GetCategory, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetCategoryResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewCategoryModelService(client, "http://test")

		// when
		res, err := service.GetCategory(context.Background(), "milk")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestCreateCategory(t *testing.T) {
	t.Run("Given valid request, When CreateCategory, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateCategoryResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewCategoryModelService(client, "http://test")

		req := &contracts.CreateCategoryRequest{}

		// when
		res, err := service.CreateCategory(context.Background(), req)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When CreateCategory, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewCategoryModelService(client, "http://test")

		req := &contracts.CreateCategoryRequest{}

		// when
		res, err := service.CreateCategory(context.Background(), req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When CreateCategory, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateCategoryResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewCategoryModelService(client, "http://test")

		req := &contracts.CreateCategoryRequest{}

		// when
		res, err := service.CreateCategory(context.Background(), req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestGetCategoryModelBackup(t *testing.T) {
	t.Run("Given valid request, When GetBackup, Then success", func(t *testing.T) {
		// given
		expectedBody := []byte("fake-binary-db-content")

		client := tests.MockRawResponse(200, expectedBody, map[string]string{
			"Content-Type":        "application/octet-stream",
			"Content-Disposition": `attachment; filename="backup.db"`,
		})

		service := NewCategoryModelService(client, "http://test")

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

		service := NewCategoryModelService(client, "http://test")

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

		service := NewCategoryModelService(client, "http://test")

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
