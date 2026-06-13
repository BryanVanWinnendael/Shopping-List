package services

import (
	"context"
	"encoding/json"
	"errors"
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
