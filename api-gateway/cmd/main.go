package main

import (
	"shopping-list/api-gateway/handlers"
	httphelper "shopping-list/api-gateway/http-helper"
	"shopping-list/api-gateway/internal/config"
	"shopping-list/api-gateway/middlewares"
	"shopping-list/api-gateway/services"
	"time"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	e := echo.New()
	e.Use(middlewares.RequestLogger)
	e.Use(middlewares.ResponseLogger)
	e.Use(middlewares.AuthMiddleware)

	httpClient := httphelper.NewClient(60 * time.Second)

	cms := services.NewCategoryModelService(httpClient, config.Vars.CategoryModelAPIURL)
	cmh := handlers.NewCategoryModelHandler(cms)

	ls := services.NewLogsService(httpClient, config.Vars.LogsAPIURL)
	lh := handlers.NewLogsHandler(ls)

	ns := services.NewNotificationsService(httpClient, config.Vars.NotificationsAPIURL)
	nh := handlers.NewNotificationsHandler(ns)

	ps := services.NewProductsSearchService(httpClient, config.Vars.ProductsSearchAPIURL)
	psh := handlers.NewProductsSearchHandler(ps)

	ss := services.NewStorageService(httpClient, config.Vars.StorageAPIURL)
	sh := handlers.NewStorageHandler(ss)

	rs := services.NewRecipesService(httpClient, config.Vars.RecipesAPIURL)
	rh := handlers.NewRecipesHandler(rs)

	cs := services.NewCronService(httpClient, config.Vars.CronAPIURL)
	ch := handlers.NewCronHandler(cs)

	handlers.SetupRoutes(e, cmh, lh, nh, psh, sh, rh, ch)

	e.Logger.Fatal(e.Start(":3000"))
}
