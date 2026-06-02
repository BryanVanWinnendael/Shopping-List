package handlers

import (
	"net/http"
	"shopping-list/shared/contracts"
	"strings"

	"github.com/labstack/echo/v4"
)

type CategoryService interface {
	GetCategory(product string) (*contracts.GetCategoryResponse, error)
	CreateCategory(request *contracts.CreateCategoryRequest) (*contracts.CreateCategoryResponse, error)
}

type CategoryHandler struct {
	CategoryService CategoryService
}

func NewCategoryHandler(cms CategoryService) *CategoryHandler {
	return &CategoryHandler{CategoryService: cms}
}

func (cms *CategoryHandler) GetCategory(c echo.Context) error {
	product := strings.TrimSpace(c.QueryParam("product"))
	if product == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "missing query parameter ?product=",
		})
	}

	result, err := cms.CategoryService.GetCategory(product)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}

func (cms *CategoryHandler) CreateCategory(c echo.Context) error {
	var request contracts.CreateCategoryRequest
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
	}

	request.Product = strings.TrimSpace(request.Product)
	request.Category = strings.TrimSpace(request.Category)

	if request.Product == "" || request.Category == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "both 'product' and 'category' are required",
		})
	}

	result, err := cms.CategoryService.CreateCategory(&request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}
