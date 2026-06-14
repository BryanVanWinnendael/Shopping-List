package handlers

import (
	"shopping-list/cron/internal/config"
	"shopping-list/shared/db"

	"github.com/labstack/echo/v4"
	"go.etcd.io/bbolt"
)

func SetupRoutes(e *echo.Echo, ch *CronHandler, bbolt *bbolt.DB) {
	cron := e.Group("/api/cron")
	cron.POST("", ch.CreateCronProduct)
	cron.GET("/products", ch.GetAllCronProducts)
	cron.PUT("/:id", ch.UpdateCronProductCategory)
	cron.DELETE("/:id", ch.DeleteCronProduct)
	cron.GET("/products/:user", ch.GetCronProductsByUser)
	cron.GET("/backup", db.BackupHandler(bbolt, config.Vars.Bucket))
}
