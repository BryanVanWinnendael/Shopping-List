package handlers

import (
	"shopping-list/recipes/internal/config"
	"shopping-list/shared/db"

	"github.com/labstack/echo/v4"
	"go.etcd.io/bbolt"
)

func SetupRoutes(e *echo.Echo, rh *RecipeHandler, orh *OnlineRecipeHandler, bbolt *bbolt.DB) {
	recipes := e.Group("/api/recipes")
	recipes.POST("", rh.CreateRecipe)
	recipes.GET("", rh.GetAllRecipes)
	recipes.GET("/countries", rh.GetDistinctCountries)
	recipes.GET("/users/:username", rh.GetRecipesByUser)
	recipes.GET("/:id", rh.GetRecipe)
	recipes.PUT("/:id", rh.UpdateRecipe)
	recipes.DELETE("/:id", rh.DeleteRecipe)
	recipes.GET("/backup", db.BackupHandler(bbolt, config.Vars.Bucket))

	onlineRecipes := e.Group("/api/online-recipes")
	onlineRecipes.GET("", orh.GetRecipes)
	onlineRecipes.GET("/details", orh.GetRecipeDetails)
	onlineRecipes.GET("/search", orh.SearchRecipes)
}
