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

func TestCreateCronProduct(t *testing.T) {
	t.Run("Given valid request, When CreateCronProduct, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateCronProductResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewCronService(client, "http://test")

		req := &contracts.CreateCronProductRequest{}

		// when
		res, err := service.CreateCronProduct(context.Background(), req)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When CreateCronProduct, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewCronService(client, "http://test")

		req := &contracts.CreateCronProductRequest{}

		// when
		res, err := service.CreateCronProduct(context.Background(), req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When CreateCronProduct, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateCronProductResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewCronService(client, "http://test")

		req := &contracts.CreateCronProductRequest{}

		// when
		res, err := service.CreateCronProduct(context.Background(), req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestGetAllCronProducts(t *testing.T) {
	t.Run("Given valid request, When GetAllCronProducts, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetAllCronProductsResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewCronService(client, "http://test")

		// when
		res, err := service.GetAllCronProducts(context.Background())

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When GetAllCronProducts, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewCronService(client, "http://test")

		// when
		res, err := service.GetAllCronProducts(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When GetAllCronProducts, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetAllCronProductsResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewCronService(client, "http://test")

		// when
		res, err := service.GetAllCronProducts(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestDeleteCronProduct(t *testing.T) {
	t.Run("Given valid request, When DeleteCronProduct, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteCronProductResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewCronService(client, "http://test")

		// when
		res, err := service.DeleteCronProduct(context.Background(), "1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When DeleteCronProduct, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewCronService(client, "http://test")

		// when
		res, err := service.DeleteCronProduct(context.Background(), "1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When DeleteCronProduct, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteCronProductResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewCronService(client, "http://test")

		// when
		res, err := service.DeleteCronProduct(context.Background(), "1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestGetCronProductsByUser(t *testing.T) {
	t.Run("Given valid request, When GetCronProductsByUser, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetCronProductsByUserResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewCronService(client, "http://test")

		// when
		res, err := service.GetCronProductsByUser(context.Background(), "user1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When GetCronProductsByUser, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewCronService(client, "http://test")

		// when
		res, err := service.GetCronProductsByUser(context.Background(), "user1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When GetCronProductsByUser, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetCronProductsByUserResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewCronService(client, "http://test")

		// when
		res, err := service.GetCronProductsByUser(context.Background(), "user1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestUpdateCronProductCategory(t *testing.T) {
	t.Run("Given valid request, When UpdateCronProductCategory, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateCronProductCategoryResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewCronService(client, "http://test")

		req := &contracts.UpdateCronProductCategoryRequest{}

		// when
		res, err := service.UpdateCronProductCategory(context.Background(), "1", req)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When UpdateCronProductCategory, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewCronService(client, "http://test")

		req := &contracts.UpdateCronProductCategoryRequest{}

		// when
		res, err := service.UpdateCronProductCategory(context.Background(), "1", req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When UpdateCronProductCategory, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateCronProductCategoryResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewCronService(client, "http://test")

		req := &contracts.UpdateCronProductCategoryRequest{}

		// when
		res, err := service.UpdateCronProductCategory(context.Background(), "1", req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestGetCronBackup(t *testing.T) {
	t.Run("Given valid request, When GetBackup, Then success", func(t *testing.T) {
		// given
		expectedBody := []byte("fake-binary-db-content")

		client := tests.MockRawResponse(200, expectedBody, map[string]string{
			"Content-Type":        "application/octet-stream",
			"Content-Disposition": `attachment; filename="backup.db"`,
		})

		service := NewCronService(client, "http://test")

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

		service := NewCronService(client, "http://test")

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

		service := NewCronService(client, "http://test")

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
