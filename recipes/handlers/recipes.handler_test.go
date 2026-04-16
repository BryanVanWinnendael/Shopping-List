package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"shopping-list/recipes/models"

	"github.com/labstack/echo/v4"
)

type MockRecipeService struct {
	CreateFunc       func(*models.RecipeCreate) (*models.RecipeResponse, error)
	GetFunc          func(string) (*models.RecipeResponse, error)
	GetAllFunc       func(int, int) ([]models.RecipeResponse, error)
	GetByUserFunc    func(string, int, int) ([]models.RecipeResponse, error)
	UpdateFunc       func(string, *models.RecipeUpdate) (*models.RecipeResponse, error)
	DeleteFunc       func(string) (bool, error)
	GetCountriesFunc func() ([]string, error)
}

func TestAddRecipe(t *testing.T) {
	t.Run("Given invalid body, When AddRecipe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodPost, "/recipes", []byte("invalid"))
		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.AddRecipe(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When AddRecipe, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.RecipeCreate{})
		c, rec := setupEcho(http.MethodPost, "/recipes", body)

		handler := NewRecipeHandler(&MockRecipeService{
			CreateFunc: func(r *models.RecipeCreate) (*models.RecipeResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.AddRecipe(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When AddRecipe, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.RecipeCreate{})
		c, rec := setupEcho(http.MethodPost, "/recipes", body)

		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.AddRecipe(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestGetRecipes(t *testing.T) {
	t.Run("Given service error, When GetRecipes, Then returns 500", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/recipes", nil)

		handler := NewRecipeHandler(&MockRecipeService{
			GetAllFunc: func(skip, limit int) ([]models.RecipeResponse, error) {
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

	t.Run("Given valid request, When GetRecipes, Then returns 200", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/recipes", nil)

		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.GetRecipes(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestGetRecipeByID(t *testing.T) {
	t.Run("Given not found, When GetRecipeByID, Then returns 404", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/recipes/1", nil)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{
			GetFunc: func(id string) (*models.RecipeResponse, error) {
				return nil, errors.New("not found")
			},
		})

		// when
		_ = handler.GetRecipeByID(c)

		// then
		if rec.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d", rec.Code)
		}
	})

	t.Run("Given valid id, When GetRecipeByID, Then returns 200", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/recipes/1", nil)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{})

		// when
		_ = handler.GetRecipeByID(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestUpdateRecipe(t *testing.T) {
	t.Run("Given invalid body, When UpdateRecipe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodPut, "/recipes/1", []byte("invalid"))
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
		body, _ := json.Marshal(models.RecipeUpdate{})
		c, rec := setupEcho(http.MethodPut, "/recipes/1", body)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{
			UpdateFunc: func(id string, r *models.RecipeUpdate) (*models.RecipeResponse, error) {
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
		body, _ := json.Marshal(models.RecipeUpdate{})
		c, rec := setupEcho(http.MethodPut, "/recipes/1", body)
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
		c, rec := setupEcho(http.MethodDelete, "/recipes/1", nil)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{
			DeleteFunc: func(id string) (bool, error) {
				return false, errors.New("fail")
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
		c, rec := setupEcho(http.MethodDelete, "/recipes/1", nil)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{
			DeleteFunc: func(id string) (bool, error) {
				return false, nil
			},
		})

		// when
		_ = handler.DeleteRecipe(c)

		// then
		if rec.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d", rec.Code)
		}
	})

	t.Run("Given success, When DeleteRecipe, Then returns 200", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodDelete, "/recipes/1", nil)
		c.SetParamNames("recipeId")
		c.SetParamValues("1")

		handler := NewRecipeHandler(&MockRecipeService{
			DeleteFunc: func(id string) (bool, error) {
				return true, nil
			},
		})

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
		c, rec := setupEcho(http.MethodGet, "/recipes/countries", nil)

		handler := NewRecipeHandler(&MockRecipeService{
			GetCountriesFunc: func() ([]string, error) {
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
		c, rec := setupEcho(http.MethodGet, "/recipes/countries", nil)

		handler := NewRecipeHandler(&MockRecipeService{
			GetCountriesFunc: func() ([]string, error) {
				return []string{"BE", "NL"}, nil
			},
		})

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
		c, rec := setupEcho(http.MethodGet, "/recipes/user/john", nil)
		c.SetParamNames("username")
		c.SetParamValues("john")

		handler := NewRecipeHandler(&MockRecipeService{
			GetByUserFunc: func(user string, skip, limit int) ([]models.RecipeResponse, error) {
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
		c, rec := setupEcho(http.MethodGet, "/recipes/user/john?skip=0&limit=10", nil)
		c.SetParamNames("username")
		c.SetParamValues("john")

		handler := NewRecipeHandler(&MockRecipeService{
			GetByUserFunc: func(user string, skip, limit int) ([]models.RecipeResponse, error) {
				if user != "john" {
					t.Fatalf("expected user 'john', got %s", user)
				}
				return []models.RecipeResponse{}, nil
			},
		})

		// when
		_ = handler.GetRecipesByUser(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given no limit provided, When GetRecipesByUser, Then defaults to 100", func(t *testing.T) {
		// given
		c, rec := setupEcho(http.MethodGet, "/recipes/user/john?skip=0", nil)
		c.SetParamNames("username")
		c.SetParamValues("john")

		handler := NewRecipeHandler(&MockRecipeService{
			GetByUserFunc: func(user string, skip, limit int) ([]models.RecipeResponse, error) {
				if limit != 100 {
					t.Fatalf("expected default limit 100, got %d", limit)
				}
				return []models.RecipeResponse{}, nil
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

func (m *MockRecipeService) CreateRecipe(r *models.RecipeCreate) (*models.RecipeResponse, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(r)
	}
	return &models.RecipeResponse{ID: "1"}, nil
}

func (m *MockRecipeService) GetRecipe(id string) (*models.RecipeResponse, error) {
	if m.GetFunc != nil {
		return m.GetFunc(id)
	}
	return &models.RecipeResponse{ID: id}, nil
}

func (m *MockRecipeService) GetRecipes(skip, limit int) ([]models.RecipeResponse, error) {
	if m.GetAllFunc != nil {
		return m.GetAllFunc(skip, limit)
	}
	return []models.RecipeResponse{}, nil
}

func (m *MockRecipeService) GetRecipesByUser(user string, skip, limit int) ([]models.RecipeResponse, error) {
	if m.GetByUserFunc != nil {
		return m.GetByUserFunc(user, skip, limit)
	}
	return []models.RecipeResponse{}, nil
}

func (m *MockRecipeService) UpdateRecipe(id string, r *models.RecipeUpdate) (*models.RecipeResponse, error) {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(id, r)
	}
	return &models.RecipeResponse{ID: id}, nil
}

func (m *MockRecipeService) DeleteRecipe(id string) (bool, error) {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(id)
	}
	return true, nil
}

func (m *MockRecipeService) GetAllDistinctCountries() ([]string, error) {
	if m.GetCountriesFunc != nil {
		return m.GetCountriesFunc()
	}
	return []string{"BE"}, nil
}
