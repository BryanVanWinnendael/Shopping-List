package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, nh *NotificationsHandler) {
	notifications := e.Group("/api/notifications")
	notifications.POST("", nh.Add)
	notifications.GET("", nh.GetAll)
	notifications.GET("/:id", nh.Get)
	notifications.GET("/users/:user", nh.GetUserNotifications)
	notifications.DELETE("/:user/:type", nh.Delete)
	notifications.POST("/push/:type/:user", nh.SendPushByType)
}
