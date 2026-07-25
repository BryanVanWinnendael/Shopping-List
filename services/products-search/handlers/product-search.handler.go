package handlers

import (
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
)

type ProductsSearchService interface {
	SearchProducts(query string, categories []models.Category, page int) (*contracts.ProductsSearchResponse, error)
	FuzzySearchProducts(query string, category models.Category, page int) (*contracts.ProductsSearchResponse, error)
}

type ProductsSearchHandler struct {
	ProductsSearchService ProductsSearchService
}

func NewProductsSearchHandler(pss ProductsSearchService) *ProductsSearchHandler {
	return &ProductsSearchHandler{ProductsSearchService: pss}
}

func (psh *ProductsSearchHandler) SearchProducts(c echo.Context) error {
	query := strings.TrimSpace(c.QueryParam("query"))

	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil || page < 1 {
		page = 1
	}

	categoryParams := c.QueryParams()["category"]
	categories := make([]models.Category, 0, len(categoryParams))
	for _, category := range categoryParams {
		category = strings.ToLower(strings.TrimSpace(category))
		if category == "fish" {
			category = "meat"
		}
		categories = append(categories, models.Category(category))
	}

	results, err := psh.ProductsSearchService.SearchProducts(query, categories, page)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, results)
}

func (psh *ProductsSearchHandler) FuzzySearchProducts(c echo.Context) error {
	query := strings.TrimSpace(c.QueryParam("query"))
	if query == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "missing query parameter ?query=",
		})
	}

	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil || page < 1 {
		page = 1
	}

	category := strings.ToLower(strings.TrimSpace(c.QueryParam("category")))
	if category == "fish" {
		category = "meat"
	}
	categoryType := models.Category(category)

	results, err := psh.ProductsSearchService.FuzzySearchProducts(query, categoryType, page)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, results)
}
