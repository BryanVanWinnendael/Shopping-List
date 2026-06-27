package handlers

import (
	"shopping-list/logs/internal/config"
	"shopping-list/shared/data"

	"github.com/labstack/echo/v4"
)

func SetupRoutes(e *echo.Echo, lh *LogsHandler) {
	logs := e.Group("/api/logs")
	logs.POST("", lh.CreateLog)
	logs.DELETE("", lh.DeleteLogs)
	logs.GET("", lh.GetLogs)
	logs.GET("/backup", data.BackupFolderHandler(config.Vars.DataDir, "logs"))
}
