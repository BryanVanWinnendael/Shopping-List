package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(g *echo.Group, sh *StorageHandler) {
	recipes := g.Group("/api/storage/recipes")
	recipes.POST("/images/:id", sh.UploadRecipesImage)
	recipes.DELETE("/images/:id", sh.DeleteRecipesImage)
	recipes.DELETE("/:id", sh.DeleteRecipesStorage)

	list := g.Group("/api/storage/list")
	list.POST("/images/:id", sh.UploadListImage)
	list.DELETE("/images/:id", sh.DeleteListImage)
}
