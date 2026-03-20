package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"shopping-list/products-search/models"

	"github.com/labstack/echo/v4"
)

type ProductsSearchService interface {
	SearchProducts(query string, categories []string, page int, pageSize int) (models.ProductsSearchResult, error)
	FuzzySearch(query string, category string, page int, pageSize int) (models.ProductsSearchResult, error)
}

type ProductsSearchHandler struct {
	ProductsSearchService ProductsSearchService
}

func NewProductsSearchHandler(pss ProductsSearchService) *ProductsSearchHandler {
	return &ProductsSearchHandler{ProductsSearchService: pss}
}

func parsePagination(c echo.Context) (int, int) {
	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.QueryParam("pageSize"))
	if err != nil || pageSize <= 0 {
		pageSize = 10
	}

	if pageSize > 100 {
		pageSize = 100
	}

	return page, pageSize
}

func (psh *ProductsSearchHandler) SearchProducts(c echo.Context) error {
	query := strings.TrimSpace(c.QueryParam("q"))
	if query == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Missing query parameter ?q=",
		})
	}

	page, pageSize := parsePagination(c)

	categories := c.QueryParams()["category"]

	for i, cat := range categories {
		if strings.ToLower(cat) == "fish" {
			categories[i] = "meat"
		}
	}

	results, err := psh.ProductsSearchService.SearchProducts(query, categories, page, pageSize)
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

	page, pageSize := parsePagination(c)

	category := strings.TrimSpace(c.QueryParam("category"))
	if strings.ToLower(category) == "fish" {
		category = "meat"
	}

	results, err := psh.ProductsSearchService.FuzzySearch(query, category, page, pageSize)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error searching products",
		})
	}

	return c.JSON(http.StatusOK, results)
}
