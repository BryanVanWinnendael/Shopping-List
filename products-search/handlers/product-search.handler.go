package handlers

import (
	"net/http"
	"strings"

	"shopping-list/products-search/models"

	"github.com/labstack/echo/v4"
)

type ProductsSearchService interface {
	SearchProducts(query string, categories []string) (models.ProductsSearchResult, error)
	FuzzySearch(query string, category string) (models.ProductsSearchResult, error)
}

type ProductsSearchHandler struct {
	ProductsSearchService ProductsSearchService
}

func NewProductsSearchHandler(pss ProductsSearchService) *ProductsSearchHandler {
	return &ProductsSearchHandler{ProductsSearchService: pss}
}

func (psh *ProductsSearchHandler) SearchProducts(c echo.Context) error {
	query := strings.TrimSpace(c.QueryParam("q"))
	if query == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing query parameter ?q=",
		})
	}

	categories := c.QueryParams()["category"]

	for i, cat := range categories {
		if strings.ToLower(cat) == "fish" {
			categories[i] = "meat"
		}
	}

	results, err := psh.ProductsSearchService.SearchProducts(query, categories)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error searching products",
		})
	}

	return c.JSON(http.StatusOK, results)
}

func (psh *ProductsSearchHandler) SearchProduct(c echo.Context) error {
	query := strings.TrimSpace(c.QueryParam("q"))
	if query == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing query parameter ?q=",
		})
	}

	category := strings.TrimSpace(c.QueryParam("category"))
	if strings.ToLower(category) == "fish" {
		category = "meat"
	}

	results, err := psh.ProductsSearchService.FuzzySearch(query, category)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error searching products",
		})
	}

	return c.JSON(http.StatusOK, results)
}
