package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"testing"

	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
)

type MockRecipesService struct {
	CreateRecipeFunc           func(ctx context.Context, req *contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error)
	GetRecipeFunc              func(ctx context.Context, id string) (*contracts.GetRecipeResponse, error)
	DeleteRecipeFunc           func(ctx context.Context, id string) (*contracts.DeleteRecipeResponse, error)
	GetRecipesFunc             func(ctx context.Context, user string, page, pageSize string) (*contracts.GetRecipesResponse, error)
	SearchRecipesFunc          func(ctx context.Context, user string, query string, page string, pageSize string) (*contracts.SearchRecipesResponse, error)
	UpdateRecipeFunc           func(ctx context.Context, id string, req *contracts.UpdateRecipeRequest) (*contracts.UpdateRecipeResponse, error)
	GetRecipesByUserFunc       func(ctx context.Context, user string) (*contracts.GetRecipesByUserResponse, error)
	GetDistinctCountriesFunc   func(ctx context.Context) (*contracts.GetDistinctCountriesResponse, error)
	GetOnlineRecipesFunc       func(ctx context.Context, page string) (*contracts.GetOnlineRecipesResponse, error)
	GetOnlineRecipeDetailsFunc func(ctx context.Context, url string) (*contracts.GetOnlineRecipeDetailsResponse, error)
	SearchOnlineRecipesFunc    func(ctx context.Context, query string, page string) (*contracts.GetOnlineRecipesResponse, error)
	GetBackupFunc              func(ctx context.Context) (*http.Response, error)
}

func TestCreateRecipe(t *testing.T) {
	t.Run("Given invalid body, When CreateRecipe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/recipes", []byte("bad-json"))

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{
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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{
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

func TestGetRecipes(t *testing.T) {
	t.Run("Given service success, When GetRecipes, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes", nil)

		handler := NewRecipesHandler(&MockRecipesService{})

		// when
		err := handler.GetRecipes(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetRecipes, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes", nil)

		handler := NewRecipesHandler(&MockRecipesService{
			GetRecipesFunc: func(context.Context, string, string, string) (*contracts.GetRecipesResponse, error) {
				return nil, errors.New("failed")
			},
		})

		// when
		err := handler.GetRecipes(c)

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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{
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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{
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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{
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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{
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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{
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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{})

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

		handler := NewRecipesHandler(&MockRecipesService{
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

		handler := NewRecipesHandler(&MockRecipesService{})

		// when
		_ = handler.SearchOnlineRecipes(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given invalid page, When SearchOnlineRecipes, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/search?query=milk&page=abc", nil)

		handler := NewRecipesHandler(&MockRecipesService{})

		// when
		_ = handler.SearchOnlineRecipes(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid query, When SearchOnlineRecipes, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/search?query=milk&page=1", nil)

		handler := NewRecipesHandler(&MockRecipesService{})

		// when
		_ = handler.SearchOnlineRecipes(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When SearchOnlineRecipes, Then returns 500", func(t *testing.T) {
		//given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/search?query=milk&page=1", nil)

		handler := NewRecipesHandler(&MockRecipesService{
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

func TestSearchRecipes(t *testing.T) {
	t.Run("Given missing query, When SearchRecipes, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/search", nil)

		handler := NewRecipesHandler(&MockRecipesService{})

		// when
		err := handler.SearchRecipes(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid query, When SearchRecipes, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/search?query=pasta&page=1&pageSize=10", nil)

		handler := NewRecipesHandler(&MockRecipesService{})

		// when
		err := handler.SearchRecipes(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given user and pagination, When SearchRecipes, Then passes params", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/search?user=Bryan&query=pasta&page=2&pageSize=20", nil)

		handler := NewRecipesHandler(&MockRecipesService{
			SearchRecipesFunc: func(
				_ context.Context,
				user string,
				query string,
				page string,
				pageSize string,
			) (*contracts.SearchRecipesResponse, error) {
				if user != "Bryan" {
					t.Fatalf("expected user Bryan, got %s", user)
				}

				if query != "pasta" {
					t.Fatalf("expected query pasta, got %s", query)
				}

				if page != "2" {
					t.Fatalf("expected page 2, got %s", page)
				}

				if pageSize != "20" {
					t.Fatalf("expected pageSize 20, got %s", pageSize)
				}

				return &contracts.SearchRecipesResponse{}, nil
			},
		})

		// when
		err := handler.SearchRecipes(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When SearchRecipes, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/search?query=pasta", nil)

		handler := NewRecipesHandler(&MockRecipesService{
			SearchRecipesFunc: func(
				context.Context,
				string,
				string,
				string,
				string,
			) (*contracts.SearchRecipesResponse, error) {
				return nil, errors.New("search failed")
			},
		})

		// when
		err := handler.SearchRecipes(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

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

func (m *MockRecipesService) GetRecipes(ctx context.Context, user string, page, pageSize string) (*contracts.GetRecipesResponse, error) {
	if m.GetRecipesFunc != nil {
		return m.GetRecipesFunc(ctx, user, page, pageSize)
	}
	return &contracts.GetRecipesResponse{}, nil
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

func (m *MockRecipesService) GetBackup(ctx context.Context) (*http.Response, error) {
	if m.GetBackupFunc != nil {
		return m.GetBackupFunc(ctx)
	}

	return &http.Response{
		StatusCode: 200,
		Header:     make(http.Header),
		Body:       io.NopCloser(bytes.NewBuffer([]byte("recipes-zip"))),
	}, nil
}

func (m *MockRecipesService) SearchRecipes(ctx context.Context, user string, query string, page string, pageSize string) (*contracts.SearchRecipesResponse, error) {
	if m.SearchRecipesFunc != nil {
		return m.SearchRecipesFunc(ctx, user, query, page, pageSize)
	}
	return &contracts.SearchRecipesResponse{}, nil
}
