package handlers

import (
	"context"
	"net/http"
	"shopping-list/api-gateway/models"
	"shopping-list/api-gateway/response"

	"github.com/labstack/echo/v4"
)

type RecipesService interface {
	CreateRecipe(ctx context.Context, request models.Recipe) (*models.Recipe, error)
	GetRecipe(ctx context.Context, recipeID string) (*models.Recipe, error)
	DeleteRecipe(ctx context.Context, recipeID string) error
	GetAllRecipes(ctx context.Context) ([]models.Recipe, error)
	UpdateRecipe(ctx context.Context, recipeID string, request models.Recipe) (*models.Recipe, error)
	GetRecipeByUser(ctx context.Context, user string) ([]models.Recipe, error)
	GetDistinctCountries(ctx context.Context) ([]string, error)
}

func NewRecipesHandler(ls RecipesService) *RecipesHandler {
	return &RecipesHandler{RecipesService: ls}
}

type RecipesHandler struct {
	RecipesService RecipesService
}

func (rh *RecipesHandler) CreateRecipe(c echo.Context) error {
	var request models.Recipe
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingRequestFields := response.GetMissingRequestFields(request)
	if len(missingRequestFields) > 0 {
		return response.Missing(c, response.SourceBody, missingRequestFields...)
	}

	result, err := rh.RecipesService.CreateRecipe(c.Request().Context(), request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) GetRecipe(c echo.Context) error {
	recipeID := c.Param("recipeID")

	missingPathParams := response.GetMissingPathParams(c, "recipeID")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	result, err := rh.RecipesService.GetRecipe(c.Request().Context(), recipeID)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) DeleteRecipe(c echo.Context) error {
	recipeID := c.Param("recipeID")

	missingPathParams := response.GetMissingPathParams(c, "recipeID")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	err := rh.RecipesService.DeleteRecipe(c.Request().Context(), recipeID)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, "Recipe deleted successfully")
}

func (rh *RecipesHandler) GetAllRecipes(c echo.Context) error {
	recipes, err := rh.RecipesService.GetAllRecipes(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, recipes)
}

func (rh *RecipesHandler) UpdateRecipe(c echo.Context) error {
	recipeID := c.Param("recipeID")

	missingPathParams := response.GetMissingPathParams(c, "recipeID")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	var request models.Recipe
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingRequestFields := response.GetMissingRequestFields(request)
	if len(missingRequestFields) > 0 {
		return response.Missing(c, response.SourceBody, missingRequestFields...)
	}

	result, err := rh.RecipesService.UpdateRecipe(c.Request().Context(), recipeID, request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) GetRecipesByUser(c echo.Context) error {
	user := c.Param("user")

	missingPathParams := response.GetMissingPathParams(c, "user")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	result, err := rh.RecipesService.GetRecipeByUser(c.Request().Context(), user)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) GetDistinctCountries(c echo.Context) error {
	countries, err := rh.RecipesService.GetDistinctCountries(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, countries)
}
