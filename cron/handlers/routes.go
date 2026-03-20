package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, ch *CronHandler) {
	cron := e.Group("/api/cron")
	cron.POST("", ch.AddCronItem)
	cron.GET("/items", ch.GetAllCronItems)
	cron.PUT("/:id", ch.UpdateCategory)
	cron.DELETE("/:id", ch.DeleteCronItem)
	cron.GET("/items/:name", ch.GetByAddedBy)
}
