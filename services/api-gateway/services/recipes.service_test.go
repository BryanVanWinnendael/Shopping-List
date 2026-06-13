package services

import (
	"context"
	"encoding/json"
	"errors"
	"testing"

	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
)

func TestCreateRecipe(t *testing.T) {
	t.Run("Given valid request, When CreateRecipe, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateRecipeResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewRecipesService(client, "http://test")

		req := &contracts.CreateRecipeRequest{}

		// when
		res, err := service.CreateRecipe(context.Background(), req)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When CreateRecipe, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewRecipesService(client, "http://test")

		req := &contracts.CreateRecipeRequest{}

		// when
		res, err := service.CreateRecipe(context.Background(), req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When CreateRecipe, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateRecipeResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewRecipesService(client, "http://test")

		req := &contracts.CreateRecipeRequest{}

		// when
		res, err := service.CreateRecipe(context.Background(), req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestGetRecipe(t *testing.T) {
	t.Run("Given valid request, When GetRecipe, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetRecipeResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewRecipesService(client, "http://test")

		// when
		res, err := service.GetRecipe(context.Background(), "recipe1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When GetRecipe, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewRecipesService(client, "http://test")

		// when
		res, err := service.GetRecipe(context.Background(), "recipe1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When GetRecipe, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetRecipeResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewRecipesService(client, "http://test")

		// when
		res, err := service.GetRecipe(context.Background(), "recipe1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestDeleteRecipe(t *testing.T) {
	t.Run("Given valid request, When DeleteRecipe, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteRecipeResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewRecipesService(client, "http://test")

		// when
		res, err := service.DeleteRecipe(context.Background(), "recipe1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When DeleteRecipe, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewRecipesService(client, "http://test")

		// when
		res, err := service.DeleteRecipe(context.Background(), "recipe1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When DeleteRecipe, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteRecipeResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewRecipesService(client, "http://test")

		// when
		res, err := service.DeleteRecipe(context.Background(), "recipe1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestGetAllRecipes(t *testing.T) {
	t.Run("Given valid request, When GetAllRecipes, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetAllRecipesResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewRecipesService(client, "http://test")

		// when
		res, err := service.GetAllRecipes(context.Background())

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When GetAllRecipes, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewRecipesService(client, "http://test")

		// when
		res, err := service.GetAllRecipes(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When GetAllRecipes, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetAllRecipesResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewRecipesService(client, "http://test")

		// when
		res, err := service.GetAllRecipes(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestUpdateRecipe(t *testing.T) {
	t.Run("Given valid request, When UpdateRecipe, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateRecipeResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewRecipesService(client, "http://test")

		req := &contracts.UpdateRecipeRequest{}

		// when
		res, err := service.UpdateRecipe(context.Background(), "recipe1", req)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When UpdateRecipe, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewRecipesService(client, "http://test")

		req := &contracts.UpdateRecipeRequest{}

		// when
		res, err := service.UpdateRecipe(context.Background(), "recipe1", req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When UpdateRecipe, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateRecipeResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewRecipesService(client, "http://test")

		// when
		res, err := service.UpdateRecipe(context.Background(), "recipe1", &contracts.UpdateRecipeRequest{})

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}
