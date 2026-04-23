package handlers

import (
	"errors"
	"net/http"
	"shopping-list/shared/tests"
	"testing"

	"shopping-list/products-search/models"
)

type MockProductsSearchService struct {
	SearchProductsFunc      func(string, []string, int, int) (models.ProductsSearchResult, error)
	FuzzySearchProductsFunc func(string, string, int, int) (models.ProductsSearchResult, error)
}

func TestSearchProducts(t *testing.T) {
	t.Run("Given missing query, When SearchProducts, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search", nil)
		handler := NewProductsSearchHandler(&MockProductsSearchService{})

		// when
		_ = handler.SearchProducts(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When SearchProducts, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search?q=apple&category=fish", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			SearchProductsFunc: func(q string, cat []string, page, size int) (models.ProductsSearchResult, error) {
				return models.ProductsSearchResult{}, errors.New("fail")
			},
		})

		// when
		_ = handler.SearchProducts(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given fish category, When SearchProducts, Then maps to meat", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search?q=apple&category=fish", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			SearchProductsFunc: func(q string, cat []string, page, size int) (models.ProductsSearchResult, error) {
				if cat[0] != "meat" {
					t.Fatalf("expected category meat, got %s", cat[0])
				}
				return models.ProductsSearchResult{}, nil
			},
		})

		// when
		_ = handler.SearchProducts(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given invalid pagination, When SearchProducts, Then defaults applied", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search?q=apple&page=0&pageSize=-1", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			SearchProductsFunc: func(q string, cat []string, page, size int) (models.ProductsSearchResult, error) {
				if page != 1 || size != 10 {
					t.Fatalf("expected defaults (1,10), got (%d,%d)", page, size)
				}
				return models.ProductsSearchResult{}, nil
			},
		})

		// when
		_ = handler.SearchProducts(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given large pageSize, When SearchProducts, Then capped at 100", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search?q=apple&pageSize=999", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			SearchProductsFunc: func(q string, cat []string, page, size int) (models.ProductsSearchResult, error) {
				if size != 100 {
					t.Fatalf("expected pageSize 100, got %d", size)
				}
				return models.ProductsSearchResult{}, nil
			},
		})

		// when
		_ = handler.SearchProducts(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestFuzzySearchProducts(t *testing.T) {
	t.Run("Given missing query, When FuzzySearchProducts, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search", nil)
		handler := NewProductsSearchHandler(&MockProductsSearchService{})

		// when
		_ = handler.FuzzySearchProducts(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When FuzzySearchProducts, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search?q=apple&category=fish", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			FuzzySearchProductsFunc: func(q, cat string, page, size int) (models.ProductsSearchResult, error) {
				return models.ProductsSearchResult{}, errors.New("fail")
			},
		})

		// when
		_ = handler.FuzzySearchProducts(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given fish category, When FuzzySearchProducts, Then maps to meat", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search?q=apple&category=fish", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			FuzzySearchProductsFunc: func(q, cat string, page, size int) (models.ProductsSearchResult, error) {
				if cat != "meat" {
					t.Fatalf("expected meat, got %s", cat)
				}
				return models.ProductsSearchResult{}, nil
			},
		})

		// when
		_ = handler.FuzzySearchProducts(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func (m *MockProductsSearchService) SearchProducts(q string, c []string, p, s int) (models.ProductsSearchResult, error) {
	if m.SearchProductsFunc != nil {
		return m.SearchProductsFunc(q, c, p, s)
	}
	return models.ProductsSearchResult{}, nil
}

func (m *MockProductsSearchService) FuzzySearchProducts(q string, c string, p, s int) (models.ProductsSearchResult, error) {
	if m.FuzzySearchProductsFunc != nil {
		return m.FuzzySearchProductsFunc(q, c, p, s)
	}
	return models.ProductsSearchResult{}, nil
}
