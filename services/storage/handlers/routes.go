package handlers

import (
	"shopping-list/shared/data"
	"shopping-list/storage/internal/config"

	"github.com/labstack/echo/v4"
)

func SetupRoutes(g *echo.Group, sh *StorageHandler) {
	recipes := g.Group("/api/storage/recipes")
	recipes.POST("/images/:id", sh.UploadRecipeImage)
	recipes.DELETE("/images/:id", sh.DeleteRecipeImage)
	recipes.DELETE("/:id", sh.DeleteRecipeStorage)
	recipes.GET("/backup", data.BackupFolderHandler(config.Vars.StorageDir, "storage"))

	list := g.Group("/api/storage/list")
	list.POST("/images/:id", sh.UploadListImage)
	list.DELETE("/images/:id", sh.DeleteListImage)
}
