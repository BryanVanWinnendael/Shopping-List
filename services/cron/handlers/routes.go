package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, ch *CronHandler) {
	cron := e.Group("/api/cron")
	cron.POST("", ch.CreateCronProduct)
	cron.GET("/products", ch.GetAllCronProducts)
	cron.PUT("/:id", ch.UpdateCronProductCategory)
	cron.DELETE("/:id", ch.DeleteCronProduct)
	cron.GET("/products/:user", ch.GetCronProductsByUser)
}
