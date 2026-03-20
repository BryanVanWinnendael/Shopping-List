package main

import (
	"shopping-list/server/handlers"
	"shopping-list/server/internal/config"
	"shopping-list/server/middlewares"
	"shopping-list/server/services"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	e := echo.New()
	e.Use(middlewares.RequestLogger)
	e.Use(middlewares.AuthMiddleware)

	rs := services.NewRecipeService()
	rh := handlers.NewRecipeHandler(rs)

	cs := services.NewCronService()
	ch := handlers.NewCronHandler(cs)

	handlers.SetupRoutes(e, rh, ch)

	e.Logger.Fatal(e.Start(":3000"))
}
