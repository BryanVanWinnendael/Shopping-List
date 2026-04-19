package main

import (
	"shopping-list/shared/middlewares"
	"shopping-list/storage/handlers"
	"shopping-list/storage/internal/config"
	"shopping-list/storage/services"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	e := echo.New()

	public := e.Group("")
	public.Static("/storage", "storage")

	private := e.Group("")
	private.Use(middlewares.RequestLogger)
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return middlewares.AuthMiddleware(next, config.Vars.APIAuthToken)
	})

	ss := services.NewStorageService()
	sh := handlers.NewStorageHandler(ss)

	handlers.SetupRoutes(private, sh)
	e.Logger.Fatal(e.Start(":3000"))
}
