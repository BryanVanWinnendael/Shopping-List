package main

import (
	"log"
	"shopping-list/category-model/handlers"
	"shopping-list/category-model/internal/config"
	"shopping-list/category-model/services"
	httphelper "shopping-list/shared/http"
	"shopping-list/shared/logger"
	"shopping-list/shared/middlewares"
	"time"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	e := echo.New()

	httpClient := httphelper.NewClient(60*time.Second, "")
	loggerClient := logger.New(httpClient, config.Vars.LogsAPIURL, "Category Model µS")

	e.Use(middlewares.TraceMiddleware)
	e.Use(middlewares.RequestLogger(loggerClient))
	e.Use(middlewares.ResponseLogger(loggerClient))

	nb := services.NewNaiveBayes()
	ms := services.NewModelService(nb)
	mh := handlers.NewModelHandler(ms)

	cs, err := services.NewCategoryService(ms)
	if err != nil {
		log.Fatal("Failed to initialize CategoryService: " + err.Error())
	}
	ch := handlers.NewCategoryHandler(cs)

	handlers.SetupRoutes(e, mh, ch)

	e.Logger.Fatal(e.Start(":" + config.Vars.Port))
}
