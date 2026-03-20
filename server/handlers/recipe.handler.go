package handlers

import (
	"net/http"
	"shopping-list/server/models"
	"strconv"

	"github.com/labstack/echo/v4"
)

type RecipeService interface {
	CreateRecipe(recipe models.RecipeCreate) ([]byte, int, error)
	GetRecipe(id string) ([]byte, int, error)
	GetRecipes(skip, limit int) ([]byte, int, error)
	GetRecipesByUser(user string, skip, limit int) ([]byte, int, error)
	UpdateRecipe(id string, update models.RecipeUpdate) ([]byte, int, error)
	DeleteRecipe(id string) ([]byte, int, error)
	GetAllDistinctCountries() ([]byte, int, error)
}

type RecipeHandler struct {
	Service RecipeService
}

func NewRecipeHandler(rs RecipeService) *RecipeHandler {
	return &RecipeHandler{Service: rs}
}

func (rh *RecipeHandler) AddRecipe(c echo.Context) error {
	var input models.RecipeCreate

	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest,
			map[string]string{"error": err.Error()})
	}

	body, status, err := rh.Service.CreateRecipe(input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError,
			map[string]string{"error": err.Error()})
	}

	return c.Blob(status, echo.MIMEApplicationJSON, body)
}

func (rh *RecipeHandler) GetRecipes(c echo.Context) error {
	skip, _ := strconv.Atoi(c.QueryParam("skip"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))

	if limit == 0 {
		limit = 100
	}

	body, status, err := rh.Service.GetRecipes(skip, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError,
			map[string]string{"error": err.Error()})
	}

	return c.Blob(status, echo.MIMEApplicationJSON, body)
}

func (rh *RecipeHandler) GetDistinctCountries(c echo.Context) error {

	body, status, err := rh.Service.GetAllDistinctCountries()
	if err != nil {
		return c.JSON(http.StatusInternalServerError,
			map[string]string{"error": err.Error()})
	}

	return c.Blob(status, echo.MIMEApplicationJSON, body)
}

func (rh *RecipeHandler) GetRecipesByUser(c echo.Context) error {
	user := c.Param("username")

	skip, _ := strconv.Atoi(c.QueryParam("skip"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))

	if limit == 0 {
		limit = 100
	}

	body, status, err :=
		rh.Service.GetRecipesByUser(user, skip, limit)

	if err != nil {
		return c.JSON(http.StatusInternalServerError,
			map[string]string{"error": err.Error()})
	}

	return c.Blob(status, echo.MIMEApplicationJSON, body)
}

func (rh *RecipeHandler) GetRecipeByID(c echo.Context) error {
	id := c.Param("recipe_id")

	body, status, err := rh.Service.GetRecipe(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError,
			map[string]string{"error": err.Error()})
	}

	return c.Blob(status, echo.MIMEApplicationJSON, body)
}

func (rh *RecipeHandler) UpdateRecipe(c echo.Context) error {
	id := c.Param("recipe_id")

	var req models.RecipeUpdate
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest,
			map[string]string{"error": "Invalid JSON"})
	}

	body, status, err :=
		rh.Service.UpdateRecipe(id, req)

	if err != nil {
		return c.JSON(http.StatusInternalServerError,
			map[string]string{"error": err.Error()})
	}

	return c.Blob(status, echo.MIMEApplicationJSON, body)
}

func (rh *RecipeHandler) DeleteRecipe(c echo.Context) error {
	id := c.Param("recipe_id")

	body, status, err := rh.Service.DeleteRecipe(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError,
			map[string]string{"error": err.Error()})
	}

	return c.Blob(status, echo.MIMEApplicationJSON, body)
}
