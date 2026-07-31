package main

import (
	httphelper "shopping-list/shared/http"
	"shopping-list/shared/logger"
	"shopping-list/shared/middlewares"
	"shopping-list/storage/handlers"
	"shopping-list/storage/internal/config"
	"shopping-list/storage/services"
	"time"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	e := echo.New()

	public := e.Group("")
	public.Static("/storage", "storage")

	httpClient := httphelper.NewClient(60*time.Second, "")
	loggerClient := logger.New(httpClient, config.Vars.LogsAPIURL, "Storage µS")

	private := e.Group("")

	private.Use(middlewares.TraceMiddleware)
	private.Use(middlewares.RequestLogger(loggerClient))
	private.Use(middlewares.ResponseLogger(loggerClient))

	private.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return middlewares.AuthMiddleware(next, config.Vars.APIAuthToken)
	})

	ss := services.NewStorageService()
	sh := handlers.NewStorageHandler(ss)

	handlers.SetupRoutes(private, sh)
	e.Logger.Fatal(e.Start(":" + config.Vars.Port))
}
