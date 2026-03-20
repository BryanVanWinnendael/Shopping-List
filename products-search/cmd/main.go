package main

import (
	"shopping-list/products-search/handlers"
	"shopping-list/products-search/internal/config"
	"shopping-list/products-search/middlewares"
	"shopping-list/products-search/services"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	e := echo.New()
	e.Use(middlewares.RequestLogger)
	e.Use(middlewares.AuthMiddleware)

	pss := services.NewProductsSearchService()
	psh := handlers.NewProductsSearchHandler(pss)

	handlers.SetupRoutes(e, psh)

	e.Logger.Fatal(e.Start(":3000"))
}
