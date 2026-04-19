package main

import (
	"net/http"
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

	bbolt := db.InitBbolt()
	firebase := db.InitFirebase()

	e := echo.New()
	e.Use(middlewares.RequestLogger)

	httpClient := &http.Client{}
	ns := services.NewNotificationService(httpClient)
	firebaseClient := services.NewFirebaseClient(firebase)
	cs := services.NewCronService(firebaseClient, bbolt, ns)
	ch := handlers.NewCronHandler(cs)

	handlers.SetupRoutes(e, ch)

	c := cron.StartCronJobs(cs)
	defer c.Stop()

	e.Logger.Fatal(e.Start(":3000"))
}
