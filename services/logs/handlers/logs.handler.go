package handlers

import (
	"net/http"
	"shopping-list/logs/models"
	"strings"

	"github.com/labstack/echo/v4"
)

type LogsService interface {
	GetLogs() ([]string, error)
	WriteLog(text string) error
	ClearLogs() error
}

func NewLogsHandler(ls LogsService) *LogsHandler {
	return &LogsHandler{LogsService: ls}
}

type LogsHandler struct {
	LogsService LogsService
}

func (lh *LogsHandler) GetShoppingListLogs(c echo.Context) error {
	logs, err := lh.LogsService.GetLogs()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]any{
		"logs": logs,
	})
}

func (lh *LogsHandler) WriteShoppingListLog(c echo.Context) error {
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

	if err := lh.LogsService.WriteLog(request.Text); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Log written",
	})
}

func (lh *LogsHandler) ClearShoppingListLogs(c echo.Context) error {
	if err := lh.LogsService.ClearLogs(); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Logs cleared",
	})
}
