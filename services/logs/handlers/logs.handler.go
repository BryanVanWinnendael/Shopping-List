package handlers

import (
	"net/http"
	"shopping-list/shared/contracts"
	"strings"

	"github.com/labstack/echo/v4"
)

type LogsService interface {
	GetAppLogs() (*contracts.GetAppLogsResponse, error)
	CreateAppLog(request *contracts.CreateAppLogRequest) (*contracts.CreateAppLogResponse, error)
	DeleteAppLogs() (*contracts.DeleteAppLogResponse, error)
}

func NewLogsHandler(ls LogsService) *LogsHandler {
	return &LogsHandler{LogsService: ls}
}

type LogsHandler struct {
	LogsService LogsService
}

func (lh *LogsHandler) GetAppLogs(c echo.Context) error {
	result, err := lh.LogsService.GetAppLogs()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}

func (lh *LogsHandler) CreateAppLog(c echo.Context) error {
	var request contracts.CreateAppLogRequest
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid JSON body",
		})
	}

	if strings.TrimSpace(request.Text) == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "text is required",
		})
	}

	result, err := lh.LogsService.CreateAppLog(&request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}

func (lh *LogsHandler) DeleteAppLogs(c echo.Context) error {
	result, err := lh.LogsService.DeleteAppLogs()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}
