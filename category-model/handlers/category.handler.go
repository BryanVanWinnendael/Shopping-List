package handlers

import (
	"net/http"
	"shopping-list/category-model/models"
	"strings"

	"github.com/labstack/echo/v4"
)

type CategoryService interface {
	GetCategory(item string) (string, error)
	AddCategory(item string, category string) error
}

type CategoryHandler struct {
	CategoryService CategoryService
}

func NewCategoryHandler(cms CategoryService) *CategoryHandler {
	return &CategoryHandler{CategoryService: cms}
}

func (cms *CategoryHandler) GetCategory(c echo.Context) error {
	item := strings.TrimSpace(c.QueryParam("item"))
	if item == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing query parameter ?item=",
		})
	}

	result, err := cms.CategoryService.GetCategory(item)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error getting category: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}

func (cms *CategoryHandler) AddCategory(c echo.Context) error {
	var request models.AddCategoryRequest
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	request.Item = strings.TrimSpace(request.Item)
	request.Category = strings.TrimSpace(request.Category)

	if request.Item == "" || request.Category == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Both 'item' and 'category' are required",
		})
	}

	err := cms.CategoryService.AddCategory(request.Item, request.Category)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to add category: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message":  "Category added successfully",
		"item":     request.Item,
		"category": request.Category,
	})
}
