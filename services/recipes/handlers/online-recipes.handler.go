package handlers

import (
	"net/http"
	"shopping-list/shared/contracts"
	"strconv"

	"github.com/labstack/echo/v4"
)

type OnlineRecipeService interface {
	GetRecipes(page int) (*contracts.GetOnlineRecipesResponse, error)
	GetRecipeDetails(url string) (*contracts.GetOnlineRecipeDetailsResponse, error)
	SearchRecipes(query string, page int) (*contracts.GetOnlineRecipesResponse, error)
}

type OnlineRecipeHandler struct {
	RecipeService OnlineRecipeService
}

func NewOnlineRecipeHandler(rs OnlineRecipeService) *OnlineRecipeHandler {
	return &OnlineRecipeHandler{RecipeService: rs}
}

func (orh *OnlineRecipeHandler) GetRecipes(c echo.Context) error {
	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil {
		page = 0
	}

	recipes, err := orh.RecipeService.GetRecipes(page)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, recipes)
}

func (orh *OnlineRecipeHandler) GetRecipeDetails(c echo.Context) error {
	url := c.QueryParam("url")
	if url == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "url query parameter is required"})
	}

	recipe, err := orh.RecipeService.GetRecipeDetails(url)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, recipe)
}

func (orh *OnlineRecipeHandler) SearchRecipes(c echo.Context) error {
	query := c.QueryParam("query")
	if query == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "query query parameter is required",
		})
	}

	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil {
		page = 1
	}

	recipes, err := orh.RecipeService.SearchRecipes(query, page)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, recipes)
}
