package main

import (
	"shopping-list/cron/cron"
	"shopping-list/cron/handlers"
	"shopping-list/cron/internal/config"
	"shopping-list/cron/services"
	"shopping-list/shared/db"
	httphelper "shopping-list/shared/http"
	"shopping-list/shared/middlewares"
	"time"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	bbolt := db.InitBbolt(config.Vars.DataDir, config.Vars.DB, config.Vars.Bucket)
	firebase := db.InitFirebase(config.Vars.GoogleApplicationCred, config.Vars.FireBaseUrl)

	e := echo.New()
	e.Use(middlewares.RequestLogger)

	httpClient := httphelper.NewClient(60*time.Second, "")

	ns := services.NewNotificationService(httpClient, config.Vars.NotificationsAPIUrl)
	firebaseClient := services.NewFirebaseClient(firebase)
	cs := services.NewCronService(firebaseClient, bbolt, ns)
	ch := handlers.NewCronHandler(cs)

	handlers.SetupRoutes(e, ch)

	c := cron.StartCronJobs(cs)
	defer c.Stop()

	e.Logger.Fatal(e.Start(":" + config.Vars.Port))
}
