package handlers

import "github.com/labstack/echo/v4"

func SetupRoutes(e *echo.Echo, lh *LogsHandler) {
	logs := e.Group("/api/logs")
	logs.POST("/shopping-list", lh.WriteShoppingListLog)
	logs.DELETE("/shopping-list", lh.ClearShoppingListLogs)
	logs.GET("/shopping-list", lh.GetShoppingListLogs)
}
