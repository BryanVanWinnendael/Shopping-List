package main

import (
	"os"
	"path/filepath"
	"shopping-list/logs/handlers"
	"shopping-list/logs/internal/config"
	"shopping-list/logs/middlewares"
	"shopping-list/logs/services"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	_ = os.MkdirAll(config.Vars.DataDir, 0755)
	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)
	_, _ = os.OpenFile(logsPath, os.O_CREATE, 0644)

	e := echo.New()
	e.Use(middlewares.RequestLogger)

	ls := services.NewLogsService()
	lh := handlers.NewLogsHandler(ls)

	handlers.SetupRoutes(e, lh)

	e.Logger.Fatal(e.Start(":3000"))
}
