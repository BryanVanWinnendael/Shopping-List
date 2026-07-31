package main

import (
	"shopping-list/products-search/handlers"
	"shopping-list/products-search/internal/config"
	"shopping-list/products-search/services"
	httphelper "shopping-list/shared/http"
	"shopping-list/shared/logger"
	"shopping-list/shared/middlewares"
	"time"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	e := echo.New()

	httpClient := httphelper.NewClient(60*time.Second, "")
	loggerClient := logger.New(httpClient, config.Vars.LogsAPIURL, "Products Search µS")

	e.Use(middlewares.TraceMiddleware)
	e.Use(middlewares.RequestLogger(loggerClient))
	e.Use(middlewares.ResponseLogger(loggerClient))

	pss := services.NewProductsSearchService()
	psh := handlers.NewProductsSearchHandler(pss)

	handlers.SetupRoutes(e, psh)

	e.Logger.Fatal(e.Start(":" + config.Vars.Port))
}
