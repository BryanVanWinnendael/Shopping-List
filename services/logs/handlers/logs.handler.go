package handlers

import (
	"net/http"
	"shopping-list/logs/models"
	"strings"

	"github.com/labstack/echo/v4"
)

type LogsService interface {
	GetAppLogs() ([]string, error)
	CreateAppLog(text string) error
	DeleteAppLogs() error
}

func NewLogsHandler(ls LogsService) *LogsHandler {
	return &LogsHandler{LogsService: ls}
}

type LogsHandler struct {
	LogsService LogsService
}

func (lh *LogsHandler) GetAppLogs(c echo.Context) error {
	logs, err := lh.LogsService.GetAppLogs()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]any{
		"logs": logs,
	})
}

func (lh *LogsHandler) CreateAppLog(c echo.Context) error {
	var request models.LogBody

	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid JSON body",
		})
	}

	if strings.TrimSpace(request.Text) == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "text is required",
		})
	}

	if err := lh.LogsService.CreateAppLog(request.Text); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Log written",
	})
}

func (lh *LogsHandler) DeleteAppLogs(c echo.Context) error {
	if err := lh.LogsService.DeleteAppLogs(); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Logs cleared",
	})
}
