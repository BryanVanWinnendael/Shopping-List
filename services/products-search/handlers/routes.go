package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, psh *ProductsSearchHandler) {
	productSearch := e.Group("/api/products")
	productSearch.GET("/search", psh.SearchProducts)
	productSearch.GET("/search/fuzzy", psh.FuzzySearchProducts)
}
