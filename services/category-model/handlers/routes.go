package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, mh *ModelHandler, ch *CategoryHandler) {
	Model := e.Group("/api/model")
	Model.POST("", mh.TrainModel)

	Category := e.Group("/api/category")
	Category.GET("", ch.GetCategory)
	Category.POST("", ch.CreateCategory)
}
