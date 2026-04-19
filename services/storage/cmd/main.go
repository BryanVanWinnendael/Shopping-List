package main

import (
	"shopping-list/storage/handlers"
	"shopping-list/storage/internal/config"
	"shopping-list/storage/middlewares"
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
	private.Use(middlewares.AuthMiddleware)

	ss := services.NewStorageService()
	sh := handlers.NewStorageHandler(ss)

	handlers.SetupRoutes(private, sh)
	e.Logger.Fatal(e.Start(":3000"))
}
