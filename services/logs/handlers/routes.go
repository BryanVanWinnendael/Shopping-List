package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, lh *LogsHandler) {
	logs := e.Group("/api/logs")
	logs.POST("/app", lh.CreateAppLog)
	logs.DELETE("/app", lh.DeleteAppLogs)
	logs.GET("/app", lh.GetAppLogs)
}
