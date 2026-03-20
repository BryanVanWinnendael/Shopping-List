package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, rh *RecipeHandler, ch *CronHandler) {
	recipes := e.Group("/api/recipes")

	recipes.POST("", rh.AddRecipe)
	recipes.GET("", rh.GetRecipes)
	recipes.GET("/countries", rh.GetDistinctCountries)
	recipes.GET("/user/:username", rh.GetRecipesByUser)
	recipes.GET("/:recipe_id", rh.GetRecipeByID)
	recipes.PUT("/:recipe_id", rh.UpdateRecipe)
	recipes.DELETE("/:recipe_id", rh.DeleteRecipe)

	cron := e.Group("/api/cron")

	cron.POST("", ch.AddCronItem)
	cron.GET("/items", ch.GetAllCronItems)
	cron.PUT("/:id", ch.UpdateCategory)
	cron.DELETE("/:id", ch.DeleteCronItem)
	cron.GET("/items/:name", ch.GetByAddedBy)
}
