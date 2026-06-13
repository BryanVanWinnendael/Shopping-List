package handlers

import (
	"context"
	"errors"
	"net/http"
	"testing"

	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
)

type MockProductsSearchService struct {
	SearchProductsFunc      func(ctx context.Context, query string, categories []string, page string, pageSize string) (*contracts.ProductsSearchResponse, error)
	FuzzySearchProductsFunc func(ctx context.Context, query string, category string, page string, pageSize string) (*contracts.ProductsSearchResponse, error)
}

func TestSearchProducts(t *testing.T) {
	t.Run("Given missing query param, When SearchProducts, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search/products", nil)

		handler := newProductsSearchHandler(&MockProductsSearchService{})

		// when
		err := handler.SearchProducts(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid query, When SearchProducts, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search/products?q=milk&category=dairy", nil)

		handler := newProductsSearchHandler(&MockProductsSearchService{})

		// when
		err := handler.SearchProducts(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When SearchProducts, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search/products?q=milk", nil)

		handler := newProductsSearchHandler(&MockProductsSearchService{
			SearchProductsFunc: func(context.Context, string, []string, string, string) (*contracts.ProductsSearchResponse, error) {
				return nil, errors.New("search failed")
			},
		})

		// when
		err := handler.SearchProducts(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestFuzzySearchProducts(t *testing.T) {
	t.Run("Given missing query param, When FuzzySearchProducts, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search/products/fuzzy", nil)

		handler := newProductsSearchHandler(&MockProductsSearchService{})

		// when
		err := handler.FuzzySearchProducts(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid query, When FuzzySearchProducts, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search/products/fuzzy?q=milk&category=dairy", nil)

		handler := newProductsSearchHandler(&MockProductsSearchService{})

		// when
		err := handler.FuzzySearchProducts(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When FuzzySearchProducts, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search/products/fuzzy?q=milk", nil)

		handler := newProductsSearchHandler(&MockProductsSearchService{
			FuzzySearchProductsFunc: func(context.Context, string, string, string, string) (*contracts.ProductsSearchResponse, error) {
				return nil, errors.New("fuzzy search failed")
			},
		})

		// when
		err := handler.FuzzySearchProducts(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func (m *MockProductsSearchService) SearchProducts(ctx context.Context, query string, categories []string, page string, pageSize string) (*contracts.ProductsSearchResponse, error) {
	if m.SearchProductsFunc != nil {
		return m.SearchProductsFunc(ctx, query, categories, page, pageSize)
	}
	return &contracts.ProductsSearchResponse{}, nil
}

func (m *MockProductsSearchService) FuzzySearchProducts(ctx context.Context, query string, category string, page string, pageSize string) (*contracts.ProductsSearchResponse, error) {
	if m.FuzzySearchProductsFunc != nil {
		return m.FuzzySearchProductsFunc(ctx, query, category, page, pageSize)
	}
	return &contracts.ProductsSearchResponse{}, nil
}

func newProductsSearchHandler(mock *MockProductsSearchService) *ProductsSearchHandler {
	return NewProductsSearchHandler(mock)
}
