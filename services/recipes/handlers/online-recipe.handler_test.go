package handlers

import (
	"errors"
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"shopping-list/shared/tests"
	"testing"
)

type MockOnlineRecipeService struct {
	GetRecipesFunc       func(filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error)
	GetRecipeDetailsFunc func(url string) (*contracts.GetOnlineRecipeDetailsResponse, error)
	SearchRecipesFunc    func(query string, filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error)
}

func TestOnlineGetRecipes(t *testing.T) {
	t.Run("Given service error, When GetRecipes, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes?page=1", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			GetRecipesFunc: func(filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error) {
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

	t.Run("Given invalid page, When GetRecipes, Then defaults to page 0", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes?page=abc", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			GetRecipesFunc: func(filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error) {
				if page != 0 {
					t.Fatalf("expected page 0, got %d", page)
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

	t.Run("Given kitchens in either param form, When GetRecipes, Then pass both forms through", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes?kitchen%5B%5D=afrikaans&kitchen=thais", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			GetRecipesFunc: func(filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error) {
				if len(filter.Kitchens) != 2 || filter.Kitchens[0] != "afrikaans" || filter.Kitchens[1] != "thais" {
					t.Fatalf("expected afrikaans + thais, got %v", filter.Kitchens)
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

func TestSearchOnlineRecipes(t *testing.T) {
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
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes/search?query=chicken&page=abc", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			SearchRecipesFunc: func(query string, filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error) {
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
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes/search?query=chicken", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			SearchRecipesFunc: func(query string, filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error) {
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
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes/search?query=chicken&page=2", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{})

		// when
		_ = handler.SearchRecipes(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given only kitchens, When SearchRecipes, Then search with an empty query", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes/search?query=&kitchen%5B%5D=frans", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			SearchRecipesFunc: func(query string, filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error) {
				if query != "" {
					t.Fatalf("expected an empty query, got %s", query)
				}

				if len(filter.Kitchens) != 1 || filter.Kitchens[0] != "frans" {
					t.Fatalf("expected frans, got %v", filter.Kitchens)
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

	t.Run("Given several kitchens, When SearchRecipes, Then pass them all to the service", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes/search?query=chicken&kitchen%5B%5D=aziatisch&kitchen%5B%5D=thais", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			SearchRecipesFunc: func(query string, filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error) {
				if len(filter.Kitchens) != 2 || filter.Kitchens[0] != "aziatisch" || filter.Kitchens[1] != "thais" {
					t.Fatalf("expected aziatisch + thais, got %v", filter.Kitchens)
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

	t.Run("Given courses, When GetRecipes, Then read them into the filter", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes?course%5B%5D=hoofdgerecht&course=dessert", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			GetRecipesFunc: func(filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error) {
				if len(filter.Courses) != 2 || filter.Courses[0] != "hoofdgerecht" || filter.Courses[1] != "dessert" {
					t.Fatalf("expected hoofdgerecht + dessert, got %v", filter.Courses)
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

	t.Run("Given dishes and specials, When GetRecipes, Then read both into the filter", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/online-recipes?dish%5B%5D=sushi&dish=wrap&special%5B%5D=vegan", nil)

		handler := NewOnlineRecipeHandler(&MockOnlineRecipeService{
			GetRecipesFunc: func(filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error) {
				if len(filter.Dishes) != 2 || filter.Dishes[0] != "sushi" || filter.Dishes[1] != "wrap" {
					t.Fatalf("expected sushi + wrap, got %v", filter.Dishes)
				}

				if len(filter.Specials) != 1 || filter.Specials[0] != "vegan" {
					t.Fatalf("expected vegan, got %v", filter.Specials)
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
}

func (m *MockOnlineRecipeService) GetRecipes(filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error) {
	if m.GetRecipesFunc != nil {
		return m.GetRecipesFunc(filter, page)
	}

	return &contracts.GetOnlineRecipesResponse{}, nil
}

func (m *MockOnlineRecipeService) GetRecipeDetails(url string) (*contracts.GetOnlineRecipeDetailsResponse, error) {
	if m.GetRecipeDetailsFunc != nil {
		return m.GetRecipeDetailsFunc(url)
	}

	return &contracts.GetOnlineRecipeDetailsResponse{}, nil
}

func (m *MockOnlineRecipeService) SearchRecipes(query string, filter models.OnlineRecipeFilter, page int) (*contracts.GetOnlineRecipesResponse, error) {
	if m.SearchRecipesFunc != nil {
		return m.SearchRecipesFunc(query, filter, page)
	}

	return &contracts.GetOnlineRecipesResponse{}, nil
}
