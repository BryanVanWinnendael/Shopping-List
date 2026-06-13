package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, cmh *CategoryModelHandler, lh *LogsHandler,
	nh *NotificationsHandler, psh *ProductsSearchHandler, sh *StorageHandler,
	rh *RecipesHandler, ch *CronHandler) {
	// Category Model routes
	categoryModel := e.Group("/api/category-model")
	categoryModel.POST("/train", cmh.TrainModel)
	categoryModel.GET("/category", cmh.GetCategory)
	categoryModel.POST("/category", cmh.CreateCategory)

	// Logs routes
	logs := e.Group("/api/logs")
	logs.GET("/app", lh.GetAppLogs)
	logs.POST("/app", lh.CreateAppLog)
	logs.DELETE("/app", lh.DeleteAppLogs)

	// Notifications routes
	notifications := e.Group("/api/notifications")
	notifications.POST("", nh.Subscribe)
	notifications.GET("/users/:user", nh.GetUserNotifications)
	notifications.GET("", nh.GetAllNotifications)
	notifications.DELETE("/:user/:notificationType", nh.DeleteUserNotification)
	notifications.POST("/push/:notificationType/:user", nh.PushUserNotificationByType)

	// Products Search routes
	productsSearch := e.Group("/api/products-search")
	productsSearch.GET("/search", psh.SearchProducts)
	productsSearch.GET("/search/fuzzy", psh.FuzzySearchProducts)

	// Storage routes
	storage := e.Group("/api/storage")
	storage.POST("/recipes/images/:id", sh.UploadRecipeImage)
	storage.DELETE("/recipes/images/:id", sh.DeleteRecipeImage)
	storage.DELETE("/recipes/:id", sh.DeleteRecipeStorage)
	storage.POST("/list/images/:id", sh.UploadListImage)
	storage.DELETE("/list/images/:id", sh.DeleteListImage)

	// Recipes routes
	recipes := e.Group("/api/recipes")
	recipes.GET("", rh.GetAllRecipes)
	recipes.POST("", rh.CreateRecipe)
	recipes.GET("/:id", rh.GetRecipe)
	recipes.DELETE("/:id", rh.DeleteRecipe)
	recipes.PUT("/:id", rh.UpdateRecipe)
	recipes.GET("/users/:user", rh.GetRecipesByUser)
	recipes.GET("/countries", rh.GetDistinctCountries)
	recipes.GET("/online", rh.GetOnlineRecipes)
	recipes.GET("/online/details", rh.GetOnlineRecipeDetails)
	recipes.GET("/online/search", rh.SearchOnlineRecipes)

	// Cron routes
	cron := e.Group("/api/cron")
	cron.GET("", ch.GetAllCronProducts)
	cron.POST("", ch.CreateCronProduct)
	cron.DELETE("/:id", ch.DeleteCronProduct)
	cron.GET("/users/:user", ch.GetCronProductsByUser)
	cron.PUT("/:id", ch.UpdateCronProductCategory)
}
