package handlers

import (
	"net/http"
	"shopping-list/shared/contracts"
	"strconv"

	"github.com/labstack/echo/v4"
)

type RecipeService interface {
	CreateRecipe(request *contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error)
	GetRecipe(id string) (*contracts.GetRecipeResponse, error)
	GetAllRecipes(skip, limit int) (*contracts.GetAllRecipesResponse, error)
	GetRecipesByUser(user string, skip, limit int) (*contracts.GetRecipesByUserResponse, error)
	UpdateRecipe(id string, request *contracts.UpdateRecipeRequest) (*contracts.UpdateRecipeResponse, error)
	DeleteRecipe(id string) (*contracts.DeleteRecipeResponse, error)
	GetAllDistinctCountries() (*contracts.GetDistinctCountriesResponse, error)
}

type RecipeHandler struct {
	RecipeService RecipeService
}

func NewRecipeHandler(rs RecipeService) *RecipeHandler {
	return &RecipeHandler{RecipeService: rs}
}

func (rh *RecipeHandler) CreateRecipe(c echo.Context) error {
	var request contracts.CreateRecipeRequest
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	created, err := rh.RecipeService.CreateRecipe(&request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, created)
}

func (rh *RecipeHandler) GetAllRecipes(c echo.Context) error {
	skip, _ := strconv.Atoi(c.QueryParam("skip"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 100
	}

	recipes, err := rh.RecipeService.GetAllRecipes(skip, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, recipes)
}

func (rh *RecipeHandler) GetDistinctCountries(c echo.Context) error {
	countries, err := rh.RecipeService.GetAllDistinctCountries()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, countries)
}

func (rh *RecipeHandler) GetRecipesByUser(c echo.Context) error {
	user := c.Param("username")
	skip, _ := strconv.Atoi(c.QueryParam("skip"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 100
	}

	recipes, err := rh.RecipeService.GetRecipesByUser(user, skip, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, recipes)
}

func (rh *RecipeHandler) GetRecipe(c echo.Context) error {
	id := c.Param("id")

	result, err := rh.RecipeService.GetRecipe(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

func (rh *RecipeHandler) UpdateRecipe(c echo.Context) error {
	id := c.Param("id")

	var request contracts.UpdateRecipeRequest
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
	}

	result, err := rh.RecipeService.UpdateRecipe(id, &request)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

func (rh *RecipeHandler) DeleteRecipe(c echo.Context) error {
	id := c.Param("id")

	result, err := rh.RecipeService.DeleteRecipe(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}
