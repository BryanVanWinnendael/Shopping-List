package handlers

import (
	"context"
	"errors"
	"net/http"
	"shopping-list/api-gateway/response"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
)

type RecipesService interface {
	CreateRecipe(ctx context.Context, request *contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error)
	GetRecipe(ctx context.Context, id string) (*contracts.GetRecipeResponse, error)
	DeleteRecipe(ctx context.Context, id string) (*contracts.DeleteRecipeResponse, error)
	GetRecipes(ctx context.Context, filters models.RecipeFilter, user string, page string) (*contracts.GetRecipesResponse, error)
	SearchRecipes(ctx context.Context, filters models.RecipeFilter, user, page string) (*contracts.SearchRecipesResponse, error)
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

func (rh *RecipesHandler) GetRecipes(c echo.Context) error {
	user := strings.TrimSpace(c.QueryParam("user"))
	page := strings.TrimSpace(c.QueryParam("page"))

	filters, err := buildRecipeFilters(c)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, err.Error())
	}

	result, err := rh.RecipesService.GetRecipes(c.Request().Context(), filters, user, page)
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

	missingQueryParams := response.GetMissingQueryParams(c, "url")
	if len(missingQueryParams) > 0 {
		return response.Missing(c, response.SourceQuery, missingQueryParams...)
	}

	result, err := rh.RecipesService.GetOnlineRecipeDetails(c.Request().Context(), url)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (rh *RecipesHandler) SearchOnlineRecipes(c echo.Context) error {
	query := c.QueryParam("query")

	missingQueryParams := response.GetMissingQueryParams(c, "query")
	if len(missingQueryParams) > 0 {
		return response.Missing(c, response.SourceQuery, missingQueryParams...)
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

func (rh *RecipesHandler) SearchRecipes(c echo.Context) error {
	user := strings.TrimSpace(c.QueryParam("user"))
	page := strings.TrimSpace(c.QueryParam("page"))

	missingQueryParams := response.GetMissingQueryParams(c, "query")
	if len(missingQueryParams) > 0 {
		return response.Missing(c, response.SourceQuery, missingQueryParams...)
	}

	filters, err := buildRecipeFilters(c)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, err.Error())
	}

	result, err := rh.RecipesService.SearchRecipes(
		c.Request().Context(),
		filters,
		user,
		page,
	)

	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func buildRecipeFilters(c echo.Context) (models.RecipeFilter, error) {
	filter := models.RecipeFilter{
		Query: strings.TrimSpace(c.QueryParam("query")),
	}

	if country := strings.TrimSpace(c.QueryParam("country")); country != "" {
		filter.Country = &country
	}

	if mealType := strings.TrimSpace(c.QueryParam("mealType")); mealType != "" {
		value := models.MealType(mealType)
		filter.MealType = &value
	}

	if public := strings.TrimSpace(c.QueryParam("public")); public != "" {
		value, err := strconv.ParseBool(public)
		if err != nil {
			return filter, errors.New("invalid public query parameter")
		}

		filter.Public = &value
	}

	if timeValue := strings.TrimSpace(c.QueryParam("time")); timeValue != "" {
		value, err := strconv.Atoi(timeValue)
		if err != nil {
			return filter, errors.New("invalid time query parameter")
		}

		filter.Time = &value
	}

	if isSaved := strings.TrimSpace(c.QueryParam("isSaved")); isSaved != "" {
		value, err := strconv.ParseBool(isSaved)
		if err != nil {
			return filter, errors.New("invalid isSaved query parameter")
		}

		filter.IsSaved = &value
	}

	return filter, nil
}
