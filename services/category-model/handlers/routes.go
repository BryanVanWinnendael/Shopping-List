package handlers

import (
	"shopping-list/category-model/internal/config"
	"shopping-list/shared/data"

	"github.com/labstack/echo/v4"
)

func SetupRoutes(e *echo.Echo, mh *ModelHandler, ch *CategoryHandler) {
	Model := e.Group("/api/model")
	Model.POST("", mh.TrainModel)
	Model.GET("/backup", data.BackupFolderHandler(config.Vars.DataDir, "category-model"))

	Category := e.Group("/api/category")
	Category.GET("", ch.GetCategory)
	Category.POST("", ch.CreateCategory)

}
