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

func TestGetRecipesBackup(t *testing.T) {
	t.Run("Given valid request, When GetBackup, Then success", func(t *testing.T) {
		// given
		expectedBody := []byte("fake-binary-db-content")

		client := tests.MockRawResponse(200, expectedBody, map[string]string{
			"Content-Type":        "application/octet-stream",
			"Content-Disposition": `attachment; filename="backup.db"`,
		})

		service := NewRecipesService(client, "http://test")

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

		service := NewRecipesService(client, "http://test")

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

		service := NewRecipesService(client, "http://test")

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
