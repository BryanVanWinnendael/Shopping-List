package handlers

import "github.com/labstack/echo/v4"

func SetupAdminRoutes(e *echo.Group, ah *AdminHandler) {
	e.GET("/backups", ah.GetBackups)
}
