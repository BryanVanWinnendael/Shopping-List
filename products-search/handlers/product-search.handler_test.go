package handlers

import (
	"bytes"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"shopping-list/products-search/models"

	"github.com/labstack/echo/v4"
)

type MockProductsSearchService struct {
	SearchFunc func(string, []string, int, int) (models.ProductsSearchResult, error)
	FuzzyFunc  func(string, string, int, int) (models.ProductsSearchResult, error)
}

func TestSearchProducts(t *testing.T) {
	t.Run("Given missing query, When SearchProducts, Then returns 400", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/search", nil)
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
		c, rec := setupEcho(http.MethodGet, "/search?q=apple&category=fish", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			SearchFunc: func(q string, cat []string, page, size int) (models.ProductsSearchResult, error) {
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
		c, rec := setupEcho(http.MethodGet, "/search?q=apple&category=fish", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			SearchFunc: func(q string, cat []string, page, size int) (models.ProductsSearchResult, error) {
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
		c, rec := setupEcho(http.MethodGet, "/search?q=apple&page=0&pageSize=-1", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			SearchFunc: func(q string, cat []string, page, size int) (models.ProductsSearchResult, error) {
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
		c, rec := setupEcho(http.MethodGet, "/search?q=apple&pageSize=999", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			SearchFunc: func(q string, cat []string, page, size int) (models.ProductsSearchResult, error) {
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

func TestSearchProduct(t *testing.T) {
	t.Run("Given missing query, When SearchProduct, Then returns 400", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/search", nil)
		handler := NewProductsSearchHandler(&MockProductsSearchService{})

		// when
		_ = handler.SearchProduct(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When SearchProduct, Then returns 500", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/search?q=apple&category=fish", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			FuzzyFunc: func(q, cat string, page, size int) (models.ProductsSearchResult, error) {
				return models.ProductsSearchResult{}, errors.New("fail")
			},
		})

		// when
		_ = handler.SearchProduct(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given fish category, When SearchProduct, Then maps to meat", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/search?q=apple&category=fish", nil)

		handler := NewProductsSearchHandler(&MockProductsSearchService{
			FuzzyFunc: func(q, cat string, page, size int) (models.ProductsSearchResult, error) {
				if cat != "meat" {
					t.Fatalf("expected meat, got %s", cat)
				}
				return models.ProductsSearchResult{}, nil
			},
		})

		// when
		_ = handler.SearchProduct(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func setupEcho(method, url string, body []byte) (echo.Context, *httptest.ResponseRecorder) {
	e := echo.New()

	var req *http.Request
	if body != nil {
		req = httptest.NewRequest(method, url, bytes.NewBuffer(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	} else {
		req = httptest.NewRequest(method, url, nil)
	}

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	return c, rec
}

func (m *MockProductsSearchService) SearchProducts(q string, c []string, p, s int) (models.ProductsSearchResult, error) {
	if m.SearchFunc != nil {
		return m.SearchFunc(q, c, p, s)
	}
	return models.ProductsSearchResult{}, nil
}

func (m *MockProductsSearchService) FuzzySearch(q string, c string, p, s int) (models.ProductsSearchResult, error) {
	if m.FuzzyFunc != nil {
		return m.FuzzyFunc(q, c, p, s)
	}
	return models.ProductsSearchResult{}, nil
}
