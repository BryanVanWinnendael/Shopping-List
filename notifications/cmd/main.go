package main

import (
	"net/http"
	"shopping-list/notifications/db"
	"shopping-list/notifications/handlers"
	"shopping-list/notifications/internal/config"
	"shopping-list/notifications/middlewares"
	"shopping-list/notifications/services"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	bbolt := db.InitBbolt()

	e := echo.New()
	e.Use(middlewares.RequestLogger)

	httpClient := &http.Client{}
	expo := services.NewExpoPushService(httpClient)
	ns := services.NewNotificationsService(bbolt, expo)
	nh := handlers.NewNotificationsHandler(ns)

	handlers.SetupRoutes(e, nh)

	e.Logger.Fatal(e.Start(":3000"))
}
