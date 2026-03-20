package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, cmh *CategoryModelHandler, lh *LogsHandler,
	nh *NotificationsHandler, psh *ProductsSearchHandler, sh *StorageHandler,
	rh *RecipesHandler, ch *CronHandler) {
	// Category Model routes
	categoryModel := e.Group("/api/category-model")
	categoryModel.POST("/train", cmh.TrainModel)
	categoryModel.GET("/category", cmh.GetCategory)
	categoryModel.POST("/category", cmh.AddCategory)

	// Logs routes
	logs := e.Group("/api/logs")
	logs.GET("/app", lh.GetAppLogs)
	logs.POST("/app", lh.CreateAppLog)
	logs.DELETE("/app", lh.DeleteAppLog)

	// Notifications routes
	notifications := e.Group("/api/notifications")
	notifications.POST("", nh.CreateNotification)
	notifications.GET("/users/:user", nh.GetUserNotifications)
	notifications.GET("", nh.GetAll)
	notifications.DELETE("/:user/:notificationType", nh.DeleteUserNotification)
	notifications.POST("/push/:type/:user", nh.SendPushNotificationByType)

	// Products Search routes
	productsSearch := e.Group("/api/products-search")
	productsSearch.GET("/search", psh.SearchProducts)
	productsSearch.GET("/search/fuzzy", psh.SearchProduct)

	// Storage routes
	storage := e.Group("/api/storage")
	storage.POST("/recipes/images/:recipesID", sh.UploadRecipesImage)
	storage.DELETE("/recipes/images/:recipesID", sh.DeleteRecipesImage)
	storage.DELETE("/recipes/:recipesID", sh.DeleteRecipeStorage)
	storage.POST("/list/images/:itemID", sh.UploadListImage)
	storage.DELETE("/list/images/:itemID", sh.DeleteListImage)

	// Recipes routes
	recipes := e.Group("/api/recipes")
	recipes.GET("", rh.GetAllRecipes)
	recipes.POST("", rh.CreateRecipe)
	recipes.GET("/:recipeID", rh.GetRecipe)
	recipes.DELETE("/:recipeID", rh.DeleteRecipe)
	recipes.PUT("/:recipeID", rh.UpdateRecipe)
	recipes.GET("/users/:user", rh.GetRecipesByUser)
	recipes.GET("/countries", rh.GetDistinctCountries)

	// Cron routes
	cron := e.Group("/api/cron")
	cron.GET("", ch.GetAllCronItems)
	cron.POST("", ch.CreateCronItem)
	cron.DELETE("/:itemID", ch.DeleteCronItem)
	cron.GET("/users/:user", ch.GetCronItemsByUser)
	cron.PUT("/:itemID", ch.UpdateCronItemCategory)
}
