package handlers

import (
	"errors"
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"shopping-list/shared/tests"
	"testing"
)

type MockProductsSearchService struct {
	SearchProductsFunc      func(string, []models.Category, int) (*contracts.ProductsSearchResponse, error)
	FuzzySearchProductsFunc func(string, models.Category, int) (*contracts.ProductsSearchResponse, error)
}

func TestSearchProducts(t *testing.T) {
	t.Run("Given service error, When SearchProducts, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/search?query=apple&category=fish", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			SearchProductsFunc: func(q string, cat []models.Category, page int) (*contracts.ProductsSearchResponse, error) {
				return &contracts.ProductsSearchResponse{}, errors.New("fail")
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
		c, rec := tests.SetupEcho(http.MethodGet, "/search?query=apple&category=fish", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			SearchProductsFunc: func(q string, cat []models.Category, page int) (*contracts.ProductsSearchResponse, error) {
				if cat[0] != "meat" {
					t.Fatalf("expected category meat, got %s", cat[0])
				}
				return &contracts.ProductsSearchResponse{}, nil
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
		c, rec := tests.SetupEcho(http.MethodGet, "/search?query=apple&page=0&pageSize=-1", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			SearchProductsFunc: func(q string, cat []models.Category, page int) (*contracts.ProductsSearchResponse, error) {
				if page != 1 {
					t.Fatalf("expected defaults 1, got %d", page)
				}
				return &contracts.ProductsSearchResponse{}, nil
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
		c, rec := tests.SetupEcho(http.MethodGet, "/search?query=apple&category=fish", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			FuzzySearchProductsFunc: func(q string, cat models.Category, page int) (*contracts.ProductsSearchResponse, error) {
				return nil, errors.New("fail")
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
		c, rec := tests.SetupEcho(http.MethodGet, "/search?query=apple&category=fish", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			FuzzySearchProductsFunc: func(q string, cat models.Category, int int) (*contracts.ProductsSearchResponse, error) {
				if cat != "meat" {
					t.Fatalf("expected meat, got %s", cat)
				}
				return &contracts.ProductsSearchResponse{}, nil
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

func (m *MockProductsSearchService) SearchProducts(q string, c []models.Category, p int) (*contracts.ProductsSearchResponse, error) {
	if m.SearchProductsFunc != nil {
		return m.SearchProductsFunc(q, c, p)
	}
	return &contracts.ProductsSearchResponse{}, nil
}

func (m *MockProductsSearchService) FuzzySearchProducts(q string, c models.Category, p int) (*contracts.ProductsSearchResponse, error) {
	if m.FuzzySearchProductsFunc != nil {
		return m.FuzzySearchProductsFunc(q, c, p)
	}
	return &contracts.ProductsSearchResponse{}, nil
}
