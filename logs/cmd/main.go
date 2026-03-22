package main

import (
	"os"
	"shopping-list/logs/handlers"
	"shopping-list/logs/internal/config"
	"shopping-list/logs/internal/constants"
	"shopping-list/logs/middlewares"
	"shopping-list/logs/services"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	_ = os.MkdirAll(config.Vars.DataDir, 0755)
	_, _ = os.OpenFile(constants.LogFile, os.O_CREATE, 0644)

	e := echo.New()
	e.Use(middlewares.RequestLogger)

	ls := services.NewLogsService()
	lh := handlers.NewLogsHandler(ls)

	handlers.SetupRoutes(e, lh)

	e.Logger.Fatal(e.Start(":3000"))
}
