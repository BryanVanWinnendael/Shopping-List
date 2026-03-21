package main

import (
	"shopping-list/cron/cron"
	"shopping-list/cron/db"
	"shopping-list/cron/handlers"
	"shopping-list/cron/internal/config"
	"shopping-list/cron/middlewares"
	"shopping-list/cron/services"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	bbolt := db.InitBolt()
	firebase := db.InitFirebase()

	e := echo.New()
	e.Use(middlewares.RequestLogger)

	ns := services.NewNotificationService()
	cs := services.NewCronService(firebase, bbolt, ns)
	ch := handlers.NewCronHandler(cs)

	handlers.SetupRoutes(e, ch)

	c := cron.StartCronJobs(cs)
	defer c.Stop()

	e.Logger.Fatal(e.Start(":3000"))
}
