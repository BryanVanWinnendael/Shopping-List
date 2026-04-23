package handlers

import (
	"context"
	"net/http"
	"shopping-list/api-gateway/models"
	"shopping-list/api-gateway/response"

	"github.com/labstack/echo/v4"
)

type LogsService interface {
	GetAppLogs(ctx context.Context) (*models.GetAppLogsResponse, error)
	CreateAppLog(ctx context.Context, request models.CreateLogRequest) error
	DeleteAppLogs(ctx context.Context) error
}

func NewLogsHandler(ls LogsService) *LogsHandler {
	return &LogsHandler{LogsService: ls}
}

type LogsHandler struct {
	LogsService LogsService
}

func (lh *LogsHandler) GetAppLogs(c echo.Context) error {
	result, err := lh.LogsService.GetAppLogs(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (lh *LogsHandler) CreateAppLog(c echo.Context) error {
	var request models.CreateLogRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingFields := response.GetMissingRequestFields(request)
	if len(missingFields) > 0 {
		return response.Missing(c, response.SourceBody, missingFields...)
	}

	err := lh.LogsService.CreateAppLog(c.Request().Context(), request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, "App log written")
}

func (lh *LogsHandler) DeleteAppLogs(c echo.Context) error {
	err := lh.LogsService.DeleteAppLogs(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, "App logs cleared")
}
