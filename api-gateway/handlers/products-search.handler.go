package handlers

import (
	"context"
	"net/http"
	"shopping-list/api-gateway/models"
	"shopping-list/api-gateway/response"
	"strings"

	"github.com/labstack/echo/v4"
)

type ProductsSearchService interface {
	SearchProducts(ctx context.Context, query string, categories []string) (models.ProductsSearchResult, error)
	SearchProduct(ctx context.Context, query string, category string) (models.ProductsSearchResult, error)
}

func NewProductsSearchHandler(ls ProductsSearchService) *ProductsSearchHandler {
	return &ProductsSearchHandler{ProductsSearchService: ls}
}

type ProductsSearchHandler struct {
	ProductsSearchService ProductsSearchService
}

func (psh *ProductsSearchHandler) SearchProducts(c echo.Context) error {
	query := strings.TrimSpace(c.QueryParam("q"))
	categories := c.QueryParams()["category"]

	missingQueryParams := response.GetMissingQueryParams(c, "q")
	if len(missingQueryParams) > 0 {
		return response.Missing(c, response.SourceQuery, missingQueryParams...)
	}

	result, err := psh.ProductsSearchService.SearchProducts(c.Request().Context(), query, categories)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (psh *ProductsSearchHandler) SearchProduct(c echo.Context) error {
	query := strings.TrimSpace(c.QueryParam("q"))
	category := c.QueryParam("category")

	missingQueryParams := response.GetMissingQueryParams(c, "q")
	if len(missingQueryParams) > 0 {
		return response.Missing(c, response.SourceQuery, missingQueryParams...)
	}

	result, err := psh.ProductsSearchService.SearchProduct(c.Request().Context(), query, category)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}
