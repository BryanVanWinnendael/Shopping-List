package main

import (
	"shopping-list/api-gateway/handlers"
	"shopping-list/api-gateway/internal/config"
	"shopping-list/api-gateway/services"
	httphelper "shopping-list/shared/http"
	"shopping-list/shared/middlewares"
	"time"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	e := echo.New()
	e.Use(middlewares.RequestLogger)
	e.Use(middlewares.ResponseLogger)

	api := e.Group("")
	api.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return middlewares.AuthMiddleware(next, config.Vars.APIAuthToken)
	})

	httpClient := httphelper.NewClient(60*time.Second, config.Vars.APIAuthToken)

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

	ah := handlers.NewAdminHandler(cs, ns, rs)

	handlers.SetupRoutes(api, cmh, lh, nh, psh, sh, rh, ch)

	admin := e.Group("/admin")
	admin.Use(middlewares.BasicAuthMiddleware(config.Vars.AdminUser, config.Vars.AdminPass))

	handlers.SetupAdminRoutes(admin, ah)

	e.Logger.Fatal(e.Start(":" + config.Vars.Port))
}
