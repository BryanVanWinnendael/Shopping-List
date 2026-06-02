package handlers

import (
	"errors"
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
	"testing"
)

type MockOnlineRecipeService struct {
	GetRecipesFunc       func(page int) (*contracts.GetOnlineRecipesResponse, error)
	GetRecipeDetailsFunc func(url string) (*contracts.GetOnlineRecipeDetailsResponse, error)
	SearchRecipesFunc    func(query string, page int) (*contracts.GetOnlineRecipesResponse, error)
}

func TestOnlineGetRecipes(t *testing.T) {
	t.Run("Given service error, When GetRecipes, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes?page=1", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			GetRecipesFunc: func(page int) (*contracts.GetOnlineRecipesResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.GetRecipes(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given invalid page, When GetRecipes, Then defaults to page 1", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes?page=abc", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			GetRecipesFunc: func(page int) (*contracts.GetOnlineRecipesResponse, error) {
				if page != 1 {
					t.Fatalf("expected page 1, got %d", page)
				}

				return &contracts.GetOnlineRecipesResponse{}, nil
			},
		})

		// when
		_ = handler.GetRecipes(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When GetRecipes, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes?page=2", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{})

		// when
		_ = handler.GetRecipes(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestOnlineGetRecipeDetails(t *testing.T) {
	t.Run("Given missing url, When GetRecipeDetails, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes/details", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{})

		// when
		_ = handler.GetRecipeDetails(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetRecipeDetails, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes/details?url=test", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			GetRecipeDetailsFunc: func(url string) (*contracts.GetOnlineRecipeDetailsResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.GetRecipeDetails(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When GetRecipeDetails, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes/details?url=test", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{})

		// when
		_ = handler.GetRecipeDetails(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestSearchRecipes(t *testing.T) {
	t.Run("Given missing query, When SearchRecipes, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes/search", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{})

		// when
		_ = handler.SearchRecipes(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given invalid page, When SearchRecipes, Then defaults to page 1", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes/search?q=chicken&page=abc", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			SearchRecipesFunc: func(query string, page int) (*contracts.GetOnlineRecipesResponse, error) {
				if page != 1 {
					t.Fatalf("expected page 1, got %d", page)
				}

				if query != "chicken" {
					t.Fatalf("expected chicken, got %s", query)
				}

				return &contracts.GetOnlineRecipesResponse{}, nil
			},
		})

		// when
		_ = handler.SearchRecipes(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When SearchRecipes, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes/search?q=chicken", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			SearchRecipesFunc: func(query string, page int) (*contracts.GetOnlineRecipesResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.SearchRecipes(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When SearchRecipes, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes/search?q=chicken&page=2", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{})

		// when
		_ = handler.SearchRecipes(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func (m *MockOnlineRecipeService) GetRecipes(page int) (*contracts.GetOnlineRecipesResponse, error) {
	if m.GetRecipesFunc != nil {
		return m.GetRecipesFunc(page)
	}

	return &contracts.GetOnlineRecipesResponse{}, nil
}

func (m *MockOnlineRecipeService) GetRecipeDetails(url string) (*contracts.GetOnlineRecipeDetailsResponse, error) {
	if m.GetRecipeDetailsFunc != nil {
		return m.GetRecipeDetailsFunc(url)
	}

	return &contracts.GetOnlineRecipeDetailsResponse{
		Title: "Recipe",
	}, nil
}

func (m *MockOnlineRecipeService) SearchRecipes(query string, page int) (*contracts.GetOnlineRecipesResponse, error) {
	if m.SearchRecipesFunc != nil {
		return m.SearchRecipesFunc(query, page)
	}

	return &contracts.GetOnlineRecipesResponse{}, nil
}
