package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, nh *NotificationsHandler) {
	notifications := e.Group("/api/notifications")
	notifications.POST("", nh.Subscribe)
	notifications.GET("", nh.GetAllNotifications)
	notifications.GET("/users/:user", nh.GetUserNotifications)
	notifications.DELETE("/:user/:type", nh.Unsubscribe)
	notifications.POST("/push/:type/:user", nh.SendPushByType)
}
