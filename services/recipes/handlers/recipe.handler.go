package handlers

import (
	"net/http"
	"shopping-list/recipes/models"
	"strconv"

	"github.com/labstack/echo/v4"
)

type RecipeService interface {
	CreateRecipe(recipe *models.RecipeCreate) (*models.RecipeResponse, error)
	GetRecipe(id string) (*models.RecipeResponse, error)
	GetAllRecipes(skip, limit int) ([]models.RecipeResponse, error)
	GetRecipesByUser(user string, skip, limit int) ([]models.RecipeResponse, error)
	UpdateRecipe(id string, update *models.RecipeUpdate) (*models.RecipeResponse, error)
	DeleteRecipe(id string) (bool, error)
	GetAllDistinctCountries() ([]string, error)
}

type RecipeHandler struct {
	RecipeService RecipeService
}

func NewRecipeHandler(rs RecipeService) *RecipeHandler {
	return &RecipeHandler{RecipeService: rs}
}

func (rh *RecipeHandler) CreateRecipe(c echo.Context) error {
	var request models.RecipeCreate
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
	id := c.Param("recipeId")

	recipe, err := rh.RecipeService.GetRecipe(id)
	if err != nil || recipe == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Recipe not found"})
	}

	return c.JSON(http.StatusOK, recipe)
}

func (rh *RecipeHandler) UpdateRecipe(c echo.Context) error {
	id := c.Param("recipeId")

	var req models.RecipeUpdate
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
	}

	updated, err := rh.RecipeService.UpdateRecipe(id, &req)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, updated)
}

func (rh *RecipeHandler) DeleteRecipe(c echo.Context) error {
	id := c.Param("recipeId")

	deleted, err := rh.RecipeService.DeleteRecipe(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	if !deleted {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Recipe not found"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Recipe deleted successfully"})
}
