package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, rh *RecipeHandler, orh *OnlineRecipeHandler) {
	recipes := e.Group("/api/recipes")
	recipes.POST("", rh.CreateRecipe)
	recipes.GET("", rh.GetAllRecipes)
	recipes.GET("/countries", rh.GetDistinctCountries)
	recipes.GET("/users/:username", rh.GetRecipesByUser)
	recipes.GET("/:id", rh.GetRecipe)
	recipes.PUT("/:id", rh.UpdateRecipe)
	recipes.DELETE("/:id", rh.DeleteRecipe)

	onlineRecipes := e.Group("/api/online-recipes")
	onlineRecipes.GET("", orh.GetRecipes)
	onlineRecipes.GET("/details", orh.GetRecipeDetails)
	onlineRecipes.GET("/search", orh.SearchRecipes)
}
