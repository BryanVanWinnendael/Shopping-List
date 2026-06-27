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

func TestSearchProducts(t *testing.T) {
	t.Run("Given valid request, When SearchProducts, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.ProductsSearchResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewProductsSearchService(client, "http://test")

		// when
		res, err := service.SearchProducts(context.Background(), "milk", []string{"dairy"}, "1", "10")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When SearchProducts, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewProductsSearchService(client, "http://test")

		// when
		res, err := service.SearchProducts(context.Background(), "", []string{"dairy"}, "1", "10")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When SearchProducts, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.ProductsSearchResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewProductsSearchService(client, "http://test")

		// when
		res, err := service.SearchProducts(context.Background(), "milk", []string{"dairy"}, "1", "10")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestFuzzySearchProducts(t *testing.T) {
	t.Run("Given valid request, When FuzzySearchProducts, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.ProductsSearchResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewProductsSearchService(client, "http://test")

		// when
		res, err := service.FuzzySearchProducts(context.Background(), "milk", "dairy", "1", "10")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When FuzzySearchProducts, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewProductsSearchService(client, "http://test")

		// when
		res, err := service.FuzzySearchProducts(context.Background(), "", "dairy", "1", "10")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When FuzzySearchProducts, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.ProductsSearchResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewProductsSearchService(client, "http://test")

		// when
		res, err := service.FuzzySearchProducts(context.Background(), "milk", "dairy", "1", "10")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestGetProductsSearchBackup(t *testing.T) {
	t.Run("Given valid request, When GetBackup, Then success", func(t *testing.T) {
		// given
		expectedBody := []byte("fake-binary-db-content")

		client := tests.MockRawResponse(200, expectedBody, map[string]string{
			"Content-Type":        "application/octet-stream",
			"Content-Disposition": `attachment; filename="backup.db"`,
		})

		service := NewProductsSearchService(client, "http://test")

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

		service := NewProductsSearchService(client, "http://test")

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

		service := NewProductsSearchService(client, "http://test")

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
