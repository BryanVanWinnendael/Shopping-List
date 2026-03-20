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
	SearchProducts(ctx context.Context, query string, categories []string, page string, pageSize string) (models.ProductsSearchResult, error)
	SearchProduct(ctx context.Context, query string, category string, page string, pageSize string) (models.ProductsSearchResult, error)
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
	page := c.QueryParam("page")
	pageSize := c.QueryParam("pageSize")

	missingQueryParams := response.GetMissingQueryParams(c, "q", page, pageSize)
	if len(missingQueryParams) > 0 {
		return response.Missing(c, response.SourceQuery, missingQueryParams...)
	}

	result, err := psh.ProductsSearchService.SearchProducts(c.Request().Context(), query, categories, page, pageSize)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (psh *ProductsSearchHandler) SearchProduct(c echo.Context) error {
	query := strings.TrimSpace(c.QueryParam("q"))
	category := c.QueryParam("category")
	page := c.QueryParam("page")
	pageSize := c.QueryParam("pageSize")

	missingQueryParams := response.GetMissingQueryParams(c, "q", page, pageSize)
	if len(missingQueryParams) > 0 {
		return response.Missing(c, response.SourceQuery, missingQueryParams...)
	}

	result, err := psh.ProductsSearchService.SearchProduct(c.Request().Context(), query, category, page, pageSize)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}
