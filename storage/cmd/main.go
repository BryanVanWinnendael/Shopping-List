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
	e.Static("/storage", "storage")
	e.Use(middlewares.RequestLogger)

	ss := services.NewStorageService()
	sh := handlers.NewStorageHandler(ss)

	api := e.Group("")
	api.Use(middlewares.AuthMiddleware)

	handlers.SetupRoutes(api, sh)

	e.Logger.Fatal(e.Start(":3000"))
}
