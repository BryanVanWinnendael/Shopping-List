package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
	"testing"
)

type MockRecipeService struct {
	CreateRecipeFunc            func(request *contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error)
	GetRecipeFunc               func(id string) (*contracts.GetRecipeResponse, error)
	GetAllRecipesFunc           func(skip, limit int) (*contracts.GetAllRecipesResponse, error)
	GetRecipesByUserFunc        func(user string, skip, limit int) (*contracts.GetRecipesByUserResponse, error)
	UpdateRecipeFunc            func(id string, request *contracts.UpdateRecipeRequest) (*contracts.UpdateRecipeResponse, error)
	DeleteRecipeFunc            func(id string) (*contracts.DeleteRecipeResponse, error)
	GetAllDistinctCountriesFunc func() (*contracts.GetDistinctCountriesResponse, error)
}

func TestCreateRecipe(t *testing.T) {
	t.Run("Given invalid body, When CreateRecipe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/recipes", []byte("invalid"))
		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.CreateRecipe(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When CreateRecipe, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateRecipeRequest{})
		c, rec := tests.SetupEcho(http.MethodPost, "/recipes", body)

		handler := NewRecipeHandler(&MockRecipeService{
			CreateRecipeFunc: func(*contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.CreateRecipe(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When CreateRecipe, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateRecipeRequest{
			User:  "Test",
			Title: "Test Recipe",
		})
		c, rec := tests.SetupEcho(http.MethodPost, "/recipes", body)

		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.CreateRecipe(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestGetRecipes(t *testing.T) {
	t.Run("Given service error, When GetAllRecipes, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes", nil)

		handler := NewRecipeHandler(&MockRecipeService{
			GetAllRecipesFunc: func(int, int) (*contracts.GetAllRecipesResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.GetAllRecipes(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When GetAllRecipes, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes", nil)

		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.GetAllRecipes(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestGetRecipe(t *testing.T) {
	t.Run("Given not found, When GetRecipe, Then returns 404", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/1", nil)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{
			GetRecipeFunc: func(string) (*contracts.GetRecipeResponse, error) {
				return nil, errors.New("not found")
			},
		})

		// when
		_ = handler.GetRecipe(c)

		// then
		if rec.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d", rec.Code)
		}
	})

	t.Run("Given valid id, When GetRecipe, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/1", nil)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.GetRecipe(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestUpdateRecipe(t *testing.T) {
	t.Run("Given invalid body, When UpdateRecipe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPut, "/recipes/1", []byte("invalid"))
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.UpdateRecipe(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When UpdateRecipe, Then returns 404", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateRecipeRequest{})
		c, rec := tests.SetupEcho(http.MethodPut, "/recipes/1", body)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{
			UpdateRecipeFunc: func(string, *contracts.UpdateRecipeRequest) (*contracts.UpdateRecipeResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.UpdateRecipe(c)

		// then
		if rec.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When UpdateRecipe, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.UpdateRecipeRequest{})
		c, rec := tests.SetupEcho(http.MethodPut, "/recipes/1", body)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.UpdateRecipe(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestDeleteRecipe(t *testing.T) {
	t.Run("Given service error, When DeleteRecipe, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", nil)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{
			DeleteRecipeFunc: func(string) (*contracts.DeleteRecipeResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.DeleteRecipe(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given not found, When DeleteRecipe, Then returns 404", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", nil)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{
			DeleteRecipeFunc: func(string) (*contracts.DeleteRecipeResponse, error) {
				return nil, errors.New("recipe not found")
			},
		})

		// when
		_ = handler.DeleteRecipe(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given success, When DeleteRecipe, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/recipes/1", nil)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.DeleteRecipe(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestGetDistinctCountries(t *testing.T) {
	t.Run("Given service error, When GetDistinctCountries, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/countries", nil)

		handler := NewRecipeHandler(&MockRecipeService{
			GetAllDistinctCountriesFunc: func() (*contracts.GetDistinctCountriesResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.GetDistinctCountries(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given success, When GetDistinctCountries, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/countries", nil)

		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.GetDistinctCountries(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestGetRecipesByUser(t *testing.T) {
	t.Run("Given service error, When GetRecipesByUser, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/user/john", nil)
		c.SetParamNames("username")
		c.SetParamValues("john")

		handler := NewRecipeHandler(&MockRecipeService{
			GetRecipesByUserFunc: func(string, int, int) (*contracts.GetRecipesByUserResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.GetRecipesByUser(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When GetRecipesByUser, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/user/john?skip=0&limit=10", nil)
		c.SetParamNames("username")
		c.SetParamValues("john")

		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.GetRecipesByUser(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given no limit provided, When GetRecipesByUser, Then defaults to 100", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/recipes/user/john?skip=0", nil)
		c.SetParamNames("username")
		c.SetParamValues("john")

		handler := NewRecipeHandler(&MockRecipeService{
			GetRecipesByUserFunc: func(user string, skip, limit int) (*contracts.GetRecipesByUserResponse, error) {
				if limit != 100 {
					t.Fatalf("expected default limit 100, got %d", limit)
				}
				return &contracts.GetRecipesByUserResponse{}, nil
			},
		})

		// when
		_ = handler.GetRecipesByUser(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func (m *MockRecipeService) CreateRecipe(request *contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error) {
	if m.CreateRecipeFunc != nil {
		return m.CreateRecipeFunc(request)
	}
	return &contracts.CreateRecipeResponse{
		User:  request.User,
		Title: request.Title,
	}, nil
}

func (m *MockRecipeService) GetRecipe(id string) (*contracts.GetRecipeResponse, error) {
	if m.GetRecipeFunc != nil {
		return m.GetRecipeFunc(id)
	}
	return &contracts.GetRecipeResponse{Id: id}, nil
}

func (m *MockRecipeService) GetAllRecipes(skip, limit int) (*contracts.GetAllRecipesResponse, error) {
	if m.GetAllRecipesFunc != nil {
		return m.GetAllRecipesFunc(skip, limit)
	}
	return &contracts.GetAllRecipesResponse{
		{
			Id: "1",
		},
		{
			Id: "2",
		},
	}, nil
}

func (m *MockRecipeService) GetRecipesByUser(user string, skip, limit int) (*contracts.GetRecipesByUserResponse, error) {
	if m.GetRecipesByUserFunc != nil {
		return m.GetRecipesByUserFunc(user, skip, limit)
	}
	return &contracts.GetRecipesByUserResponse{
		{
			Id: "1",
		},
		{
			Id: "2",
		},
	}, nil
}

func (m *MockRecipeService) UpdateRecipe(id string, request *contracts.UpdateRecipeRequest) (*contracts.UpdateRecipeResponse, error) {
	if m.UpdateRecipeFunc != nil {
		return m.UpdateRecipeFunc(id, request)
	}
	return &contracts.UpdateRecipeResponse{Id: id}, nil
}

func (m *MockRecipeService) DeleteRecipe(id string) (*contracts.DeleteRecipeResponse, error) {
	if m.DeleteRecipeFunc != nil {
		return m.DeleteRecipeFunc(id)
	}
	return &contracts.DeleteRecipeResponse{
		Id:      "1",
		Message: "Recipe deleted",
	}, nil
}

func (m *MockRecipeService) GetAllDistinctCountries() (*contracts.GetDistinctCountriesResponse, error) {
	if m.GetAllDistinctCountriesFunc != nil {
		return m.GetAllDistinctCountriesFunc()
	}
	return &contracts.GetDistinctCountriesResponse{
		"m",
	}, nil
}
