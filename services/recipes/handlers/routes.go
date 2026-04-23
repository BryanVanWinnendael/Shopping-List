package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, rh *RecipeHandler) {
	recipes := e.Group("/api/recipes")
	recipes.POST("", rh.CreateRecipe)
	recipes.GET("", rh.GetAllRecipes)
	recipes.GET("/countries", rh.GetDistinctCountries)
	recipes.GET("/user/:username", rh.GetRecipesByUser)
	recipes.GET("/:recipeId", rh.GetRecipe)
	recipes.PUT("/:recipeId", rh.UpdateRecipe)
	recipes.DELETE("/:recipeId", rh.DeleteRecipe)
}
