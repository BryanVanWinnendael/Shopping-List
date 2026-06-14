package handlers

import (
	"context"
	"net/http"
	"shopping-list/api-gateway/response"
	"shopping-list/shared/contracts"
	"strconv"

	"github.com/labstack/echo/v4"
)

type RecipesService interface {
	CreateRecipe(ctx context.Context, request *contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error)
	GetRecipe(ctx context.Context, id string) (*contracts.GetRecipeResponse, error)
	DeleteRecipe(ctx context.Context, id string) (*contracts.DeleteRecipeResponse, error)
	GetAllRecipes(ctx context.Context) (*contracts.GetAllRecipesResponse, error)
	UpdateRecipe(ctx context.Context, id string, request *contracts.UpdateRecipeRequest) (*contracts.UpdateRecipeResponse, error)
	GetRecipesByUser(ctx context.Context, user string) (*contracts.GetRecipesByUserResponse, error)
	GetDistinctCountries(ctx context.Context) (*contracts.GetDistinctCountriesResponse, error)
	GetOnlineRecipes(ctx context.Context, page string) (*contracts.GetOnlineRecipesResponse, error)
	GetOnlineRecipeDetails(ctx context.Context, url string) (*contracts.GetOnlineRecipeDetailsResponse, error)
	SearchOnlineRecipes(ctx context.Context, query string, page string) (*contracts.GetOnlineRecipesResponse, error)
	GetBackup(ctx context.Context) (*http.Response, error)
}

func NewRecipesHandler(ls RecipesService) *RecipesHandler {
	return &RecipesHandler{RecipesService: ls}
}

type RecipesHandler struct {
	RecipesService RecipesService
}

func (rh *RecipesHandler) CreateRecipe(c echo.Context) error {
	var request contracts.CreateRecipeRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingRequestFields := response.GetMissingRequestFields(request)
	if len(missingRequestFields) > 0 {
		return response.Missing(c, response.SourceBody, missingRequestFields...)
	}

	result, err := rh.RecipesService.CreateRecipe(c.Request().Context(), &request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) GetRecipe(c echo.Context) error {
	id := c.Param("id")

	missingPathParams := response.GetMissingPathParams(c, "id")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	result, err := rh.RecipesService.GetRecipe(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) DeleteRecipe(c echo.Context) error {
	id := c.Param("id")

	missingPathParams := response.GetMissingPathParams(c, "id")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	result, err := rh.RecipesService.DeleteRecipe(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) GetAllRecipes(c echo.Context) error {
	result, err := rh.RecipesService.GetAllRecipes(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) UpdateRecipe(c echo.Context) error {
	id := c.Param("id")

	missingPathParams := response.GetMissingPathParams(c, "id")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	var request contracts.UpdateRecipeRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingRequestFields := response.GetMissingRequestFields(request)
	if len(missingRequestFields) > 0 {
		return response.Missing(c, response.SourceBody, missingRequestFields...)
	}

	result, err := rh.RecipesService.UpdateRecipe(c.Request().Context(), id, &request)
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

	result, err := rh.RecipesService.GetRecipesByUser(c.Request().Context(), user)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) GetDistinctCountries(c echo.Context) error {
	result, err := rh.RecipesService.GetDistinctCountries(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) GetOnlineRecipes(c echo.Context) error {
	pageStr := c.QueryParam("page")
	if pageStr != "" {
		_, err := strconv.Atoi(pageStr)
		if err != nil {
			return response.Error(c, http.StatusBadRequest, "invalid page query parameter")
		}
	}

	result, err := rh.RecipesService.GetOnlineRecipes(c.Request().Context(), pageStr)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) GetOnlineRecipeDetails(c echo.Context) error {
	url := c.QueryParam("url")
	if url == "" {
		return response.Missing(c, response.SourceQuery, "url")
	}

	result, err := rh.RecipesService.GetOnlineRecipeDetails(c.Request().Context(), url)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) SearchOnlineRecipes(c echo.Context) error {
	query := c.QueryParam("q")
	if query == "" {
		return response.Missing(c, response.SourceQuery, "q")
	}

	pageStr := c.QueryParam("page")
	if pageStr != "" {
		_, err := strconv.Atoi(pageStr)
		if err != nil {
			return response.Error(c, http.StatusBadRequest, "invalid page query parameter")
		}
	}

	result, err := rh.RecipesService.SearchOnlineRecipes(c.Request().Context(), query, pageStr)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}
