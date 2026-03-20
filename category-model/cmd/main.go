package main

import (
	"log"
	"shopping-list/category-model/handlers"
	"shopping-list/category-model/internal/config"
	"shopping-list/category-model/middlewares"
	"shopping-list/category-model/services"
	"shopping-list/category-model/utils"

	"github.com/labstack/echo/v4"
)

func main() {
	config.LoadEnv()

	e := echo.New()
	e.Use(middlewares.RequestLogger)
	e.Use(middlewares.AuthMiddleware)

	nb := utils.NewNaiveBayes()
	ms := services.NewModelService(nb)
	mh := handlers.NewModelHandler(ms)

	cs, err := services.NewCategoryService(ms)
	if err != nil {
		log.Fatal("Failed to initialize CategoryService: " + err.Error())
	}
	ch := handlers.NewCategoryHandler(cs)

	handlers.SetupRoutes(e, mh, ch)

	e.Logger.Fatal(e.Start(":3000"))
}
