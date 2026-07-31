package handlers

import (
	"shopping-list/products-search/internal/config"
	"shopping-list/shared/data"

	"github.com/labstack/echo/v4"
)

func SetupRoutes(e *echo.Echo, psh *ProductsSearchHandler) {
	productSearch := e.Group("/api/products")
	productSearch.GET("/search", psh.SearchProducts)
	productSearch.GET("/search/fuzzy", psh.FuzzySearchProducts)
	productSearch.GET("/backup", data.BackupFolderHandler(config.Vars.DataDir, "products-search"))
}
