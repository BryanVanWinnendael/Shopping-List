package main

import (
	"shopping-list/products-search/handlers"
	"shopping-list/products-search/internal/config"
	"shopping-list/products-search/services"
	"shopping-list/shared/middlewares"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	e := echo.New()
	e.Use(middlewares.RequestLogger)

	pss := services.NewProductsSearchService()
	psh := handlers.NewProductsSearchHandler(pss)

	handlers.SetupRoutes(e, psh)

	e.Logger.Fatal(e.Start(":3000"))
}
