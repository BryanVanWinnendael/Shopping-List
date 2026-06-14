package handlers

import (
	"shopping-list/notifications/internal/config"
	"shopping-list/shared/db"

	"github.com/labstack/echo/v4"
	"go.etcd.io/bbolt"
)

func SetupRoutes(e *echo.Echo, nh *NotificationsHandler, bbolt *bbolt.DB) {
	notifications := e.Group("/api/notifications")
	notifications.POST("", nh.Subscribe)
	notifications.GET("", nh.GetAllNotifications)
	notifications.GET("/users/:user", nh.GetUserNotifications)
	notifications.DELETE("/:user/:type", nh.Unsubscribe)
	notifications.POST("/push/:type/:user", nh.PushUserNotificationByType)
	notifications.GET("/backup", db.BackupHandler(bbolt, config.Vars.Bucket))
}
