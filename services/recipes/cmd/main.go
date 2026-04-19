package main

import (
	"shopping-list/recipes/db"
	"shopping-list/recipes/handlers"
	"shopping-list/recipes/internal/config"
	"shopping-list/recipes/services"
	"shopping-list/shared/middlewares"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	bbolt := db.InitBbolt()

	e := echo.New()
	e.Use(middlewares.RequestLogger)

	rs := services.NewRecipeService(bbolt)
	rh := handlers.NewRecipeHandler(rs)

	handlers.SetupRoutes(e, rh)

	e.Logger.Fatal(e.Start(":3000"))
}
