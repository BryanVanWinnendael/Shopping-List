package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"testing"

	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
)

type MockRecipesService struct {
	CreateRecipeFunc           func(ctx context.Context, req *contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error)
	GetRecipeFunc              func(ctx context.Context, id string) (*contracts.GetRecipeResponse, error)
	DeleteRecipeFunc           func(ctx context.Context, id string) (*contracts.DeleteRecipeResponse, error)
	GetAllRecipesFunc          func(ctx context.Context) (*contracts.GetAllRecipesResponse, error)
	UpdateRecipeFunc           func(ctx context.Context, id string, req *contracts.UpdateRecipeRequest) (*contracts.UpdateRecipeResponse, error)
	GetRecipesByUserFunc       func(ctx context.Context, user string) (*contracts.GetRecipesByUserResponse, error)
	GetDistinctCountriesFunc   func(ctx context.Context) (*contracts.GetDistinctCountriesResponse, error)
	GetOnlineRecipesFunc       func(ctx context.Context, page string) (*contracts.GetOnlineRecipesResponse, error)
	GetOnlineRecipeDetailsFunc func(ctx context.Context, url string) (*contracts.GetOnlineRecipeDetailsResponse, error)
	SearchOnlineRecipesFunc    func(ctx context.Context, query string, page string) (*contracts.GetOnlineRecipesResponse, error)
}

func TestCreateRecipe(t *testing.T) {
	t.Run("Given invalid body, When CreateRecipe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/recipes", []byte("bad-json"))

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		err := handler.CreateRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When CreateRecipe, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateRecipeRequest{
			User:  "test",
			Title: "test",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/recipes", body)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		err := handler.CreateRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When CreateRecipe, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateRecipeRequest{
			User:  "test",
			Title: "test",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/recipes", body)

		handler := newRecipesHandler(&MockRecipesService{
			CreateRecipeFunc: func(context.Context, *contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error) {
				return nil, errors.New("create failed")
			},
		})

		// when
		err := handler.CreateRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetRecipe(t *testing.T) {
	t.Run("Given missing id, When GetRecipe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes", nil)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		err := handler.GetRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid id, When GetRecipe, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		err := handler.GetRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetRecipe, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newRecipesHandler(&MockRecipesService{
			GetRecipeFunc: func(context.Context, string) (*contracts.GetRecipeResponse, error) {
				return nil, errors.New("get failed")
			},
		})

		// when
		err := handler.GetRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetAllRecipes(t *testing.T) {
	t.Run("Given service success, When GetAllRecipes, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes", nil)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		err := handler.GetAllRecipes(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetAllRecipes, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes", nil)

		handler := newRecipesHandler(&MockRecipesService{
			GetAllRecipesFunc: func(context.Context) (*contracts.GetAllRecipesResponse, error) {
				return nil, errors.New("failed")
			},
		})

		// when
		err := handler.GetAllRecipes(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetOnlineRecipes(t *testing.T) {
	t.Run("Given valid page, When GetOnlineRecipes, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/online?page=1", nil)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		err := handler.GetOnlineRecipes(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given invalid page, When GetOnlineRecipes, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/online?page=abc", nil)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		err := handler.GetOnlineRecipes(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetOnlineRecipes, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/online?page=1", nil)

		handler := newRecipesHandler(&MockRecipesService{
			GetOnlineRecipesFunc: func(context.Context, string) (*contracts.GetOnlineRecipesResponse, error) {
				return nil, errors.New("failed")
			},
		})

		// when
		err := handler.GetOnlineRecipes(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestDeleteRecipe(t *testing.T) {
	t.Run("Given missing id, When DeleteRecipe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes", nil)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		err := handler.DeleteRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid id, When DeleteRecipe, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		err := handler.DeleteRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteRecipe, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", nil)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newRecipesHandler(&MockRecipesService{
			DeleteRecipeFunc: func(context.Context, string) (*contracts.DeleteRecipeResponse, error) {
				return nil, errors.New("delete failed")
			},
		})

		// when
		err := handler.DeleteRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestUpdateRecipe(t *testing.T) {
	t.Run("Given missing id, When UpdateRecipe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPut, "/recipes", []byte(`{}`))

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		err := handler.UpdateRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given invalid body, When UpdateRecipe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPut, "/recipes/1", []byte("invalid"))
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		err := handler.UpdateRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When UpdateRecipe, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateRecipeRequest{
			Title: "updated",
			User:  "test",
		})

		c, rec := tests.SetupEcho(http.MethodPut, "/recipes/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		err := handler.UpdateRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When UpdateRecipe, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateRecipeRequest{
			Title: "updated",
			User:  "test",
		})

		c, rec := tests.SetupEcho(http.MethodPut, "/recipes/1", body)
		c.SetParamNames("id")
		c.SetParamValues("1")

		handler := newRecipesHandler(&MockRecipesService{
			UpdateRecipeFunc: func(context.Context, string, *contracts.UpdateRecipeRequest) (*contracts.UpdateRecipeResponse, error) {
				return nil, errors.New("update failed")
			},
		})

		// when
		err := handler.UpdateRecipe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetRecipesByUser(t *testing.T) {
	t.Run("Given missing user, When GetRecipesByUser, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/users", nil)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		_ = handler.GetRecipesByUser(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid user, When GetRecipesByUser, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/users/test", nil)
		c.SetParamNames("user")
		c.SetParamValues("test")

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		_ = handler.GetRecipesByUser(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetRecipesByUser, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/users/test", nil)
		c.SetParamNames("user")
		c.SetParamValues("test")

		handler := newRecipesHandler(&MockRecipesService{
			GetRecipesByUserFunc: func(context.Context, string) (*contracts.GetRecipesByUserResponse, error) {
				return nil, errors.New("failed")
			},
		})

		// when
		_ = handler.GetRecipesByUser(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetDistinctCountries(t *testing.T) {
	t.Run("Given success, When GetDistinctCountries, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/countries", nil)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		_ = handler.GetDistinctCountries(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetDistinctCountries, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/countries", nil)

		handler := newRecipesHandler(&MockRecipesService{
			GetDistinctCountriesFunc: func(context.Context) (*contracts.GetDistinctCountriesResponse, error) {
				return nil, errors.New("failed")
			},
		})

		// when
		_ = handler.GetDistinctCountries(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetOnlineRecipeDetails(t *testing.T) {
	t.Run("Given missing url, When GetOnlineRecipeDetails, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/details", nil)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		_ = handler.GetOnlineRecipeDetails(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid url, When GetOnlineRecipeDetails, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/details?url=test", nil)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		_ = handler.GetOnlineRecipeDetails(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetOnlineRecipeDetails, Then returns 500", func(t *testing.T) {
		//given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/details?url=test", nil)

		handler := newRecipesHandler(&MockRecipesService{
			GetOnlineRecipeDetailsFunc: func(context.Context, string) (*contracts.GetOnlineRecipeDetailsResponse, error) {
				return nil, errors.New("failed")
			},
		})

		// when
		_ = handler.GetOnlineRecipeDetails(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestSearchOnlineRecipes(t *testing.T) {
	t.Run("Given missing query, When SearchOnlineRecipes, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/search", nil)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		_ = handler.SearchOnlineRecipes(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given invalid page, When SearchOnlineRecipes, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/search?q=milk&page=abc", nil)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		_ = handler.SearchOnlineRecipes(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid query, When SearchOnlineRecipes, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/search?q=milk&page=1", nil)

		handler := newRecipesHandler(&MockRecipesService{})

		// when
		_ = handler.SearchOnlineRecipes(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When SearchOnlineRecipes, Then returns 500", func(t *testing.T) {
		//given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/search?q=milk&page=1", nil)

		handler := newRecipesHandler(&MockRecipesService{
			SearchOnlineRecipesFunc: func(context.Context, string, string) (*contracts.GetOnlineRecipesResponse, error) {
				return nil, errors.New("failed")
			},
		})

		// when
		_ = handler.SearchOnlineRecipes(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func (m *MockRecipesService) CreateRecipe(ctx context.Context, req *contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error) {
	if m.CreateRecipeFunc != nil {
		return m.CreateRecipeFunc(ctx, req)
	}
	return &contracts.CreateRecipeResponse{}, nil
}

func (m *MockRecipesService) GetRecipe(ctx context.Context, id string) (*contracts.GetRecipeResponse, error) {
	if m.GetRecipeFunc != nil {
		return m.GetRecipeFunc(ctx, id)
	}
	return &contracts.GetRecipeResponse{}, nil
}

func (m *MockRecipesService) DeleteRecipe(ctx context.Context, id string) (*contracts.DeleteRecipeResponse, error) {
	if m.DeleteRecipeFunc != nil {
		return m.DeleteRecipeFunc(ctx, id)
	}
	return &contracts.DeleteRecipeResponse{}, nil
}

func (m *MockRecipesService) GetAllRecipes(ctx context.Context) (*contracts.GetAllRecipesResponse, error) {
	if m.GetAllRecipesFunc != nil {
		return m.GetAllRecipesFunc(ctx)
	}
	return &contracts.GetAllRecipesResponse{}, nil
}

func (m *MockRecipesService) UpdateRecipe(ctx context.Context, id string, req *contracts.UpdateRecipeRequest) (*contracts.UpdateRecipeResponse, error) {
	if m.UpdateRecipeFunc != nil {
		return m.UpdateRecipeFunc(ctx, id, req)
	}
	return &contracts.UpdateRecipeResponse{}, nil
}

func (m *MockRecipesService) GetRecipesByUser(ctx context.Context, user string) (*contracts.GetRecipesByUserResponse, error) {
	if m.GetRecipesByUserFunc != nil {
		return m.GetRecipesByUserFunc(ctx, user)
	}
	return &contracts.GetRecipesByUserResponse{}, nil
}

func (m *MockRecipesService) GetDistinctCountries(ctx context.Context) (*contracts.GetDistinctCountriesResponse, error) {
	if m.GetDistinctCountriesFunc != nil {
		return m.GetDistinctCountriesFunc(ctx)
	}
	return &contracts.GetDistinctCountriesResponse{}, nil
}

func (m *MockRecipesService) GetOnlineRecipes(ctx context.Context, page string) (*contracts.GetOnlineRecipesResponse, error) {
	if m.GetOnlineRecipesFunc != nil {
		return m.GetOnlineRecipesFunc(ctx, page)
	}
	return &contracts.GetOnlineRecipesResponse{}, nil
}

func (m *MockRecipesService) GetOnlineRecipeDetails(ctx context.Context, url string) (*contracts.GetOnlineRecipeDetailsResponse, error) {
	if m.GetOnlineRecipeDetailsFunc != nil {
		return m.GetOnlineRecipeDetailsFunc(ctx, url)
	}
	return &contracts.GetOnlineRecipeDetailsResponse{}, nil
}

func (m *MockRecipesService) SearchOnlineRecipes(ctx context.Context, query string, page string) (*contracts.GetOnlineRecipesResponse, error) {
	if m.SearchOnlineRecipesFunc != nil {
		return m.SearchOnlineRecipesFunc(ctx, query, page)
	}
	return &contracts.GetOnlineRecipesResponse{}, nil
}

func newRecipesHandler(mock *MockRecipesService) *RecipesHandler {
	return NewRecipesHandler(mock)
}
