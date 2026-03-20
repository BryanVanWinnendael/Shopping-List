package main

import (
	"shopping-list/recipes/db"
	"shopping-list/recipes/handlers"
	"shopping-list/recipes/internal/config"
	"shopping-list/recipes/middlewares"
	"shopping-list/recipes/services"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	bbolt := db.InitBolt()

	e := echo.New()
	e.Use(middlewares.RequestLogger)
	e.Use(middlewares.AuthMiddleware)

	rs := services.NewRecipeService(bbolt)
	rh := handlers.NewRecipeHandler(rs)

	handlers.SetupRoutes(e, rh)

	e.Logger.Fatal(e.Start(":3000"))
}
