package main

import (
	"shopping-list/recipes/handlers"
	"shopping-list/recipes/internal/config"
	"shopping-list/recipes/services"
	"shopping-list/shared/db"
	httphelper "shopping-list/shared/http"
	"shopping-list/shared/middlewares"
	"time"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	bbolt := db.InitBbolt(config.Vars.DataDir, config.Vars.DB, config.Vars.Bucket)

	e := echo.New()
	e.Use(middlewares.RequestLogger)

	httpClient := httphelper.NewClient(60*time.Second, "")

	rs := services.NewRecipeService(bbolt)
	rh := handlers.NewRecipeHandler(rs)
	ors := services.NewOnlineRecipeService(httpClient, config.Vars.OnlineRecipesAPIUrl)
	orh := handlers.NewOnlineRecipeHandler(ors)

	handlers.SetupRoutes(e, rh, orh)

	e.Logger.Fatal(e.Start(":" + config.Vars.Port))
}
