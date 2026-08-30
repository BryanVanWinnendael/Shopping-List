package handlers

import (
	"fmt"
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
)

type RecipeService interface {
	CreateRecipe(request *contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error)
	GetRecipe(id string) (*contracts.GetRecipeResponse, error)
	GetRecipes(user string, filter models.RecipeFilter, page int) (*contracts.GetRecipesResponse, error)
	SearchRecipes(user string, filter models.RecipeFilter, page int) (*contracts.SearchRecipesResponse, error)
	GetRecipesByUser(user string) (*contracts.GetRecipesByUserResponse, error)
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

func (rh *RecipeHandler) GetRecipes(c echo.Context) error {
	user := c.QueryParam("user")

	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil || page < 1 {
		page = 1
	}

	filter := buildRecipeFilter(c)

	recipes, err := rh.RecipeService.GetRecipes(user, filter, page)
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
	user := c.Param("user")

	recipes, err := rh.RecipeService.GetRecipesByUser(user)
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

func (rh *RecipeHandler) SearchRecipes(c echo.Context) error {
	user := c.QueryParam("user")

	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil || page < 1 {
		page = 1
	}

	filter := buildRecipeFilter(c)

	recipes, err := rh.RecipeService.SearchRecipes(user, filter, page)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, recipes)
}

func buildRecipeFilter(c echo.Context) models.RecipeFilter {
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
		fmt.Println("jee")
		if value, err := strconv.ParseBool(public); err == nil {
			filter.Public = &value
		}
	}

	if time := strings.TrimSpace(c.QueryParam("time")); time != "" {
		if value, err := strconv.Atoi(time); err == nil {
			filter.Time = &value
		}
	}

	if isSaved := strings.TrimSpace(c.QueryParam("isSaved")); isSaved != "" {
		if value, err := strconv.ParseBool(isSaved); err == nil {
			filter.IsSaved = &value
		}
	}

	return filter
}
