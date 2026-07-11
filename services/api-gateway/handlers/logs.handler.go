package handlers

import (
	"context"
	"net/http"
	"shopping-list/api-gateway/response"
	"shopping-list/shared/contracts"
	"strings"

	"github.com/labstack/echo/v4"
)

type LogsService interface {
	GetLogs(ctx context.Context, page string) (*contracts.GetLogsResponse, error)
	SearchLogs(ctx context.Context, query string, page string) (*contracts.SearchLogsResponse, error)
	CreateLog(ctx context.Context, request *contracts.CreateLogRequest) (*contracts.CreateLogResponse, error)
	DeleteLogs(ctx context.Context) (*contracts.DeleteLogResponse, error)
	GetBackup(ctx context.Context) (*http.Response, error)
}

func NewLogsHandler(ls LogsService) *LogsHandler {
	return &LogsHandler{LogsService: ls}
}

type LogsHandler struct {
	LogsService LogsService
}

func (lh *LogsHandler) GetLogs(c echo.Context) error {
	page := strings.TrimSpace(c.QueryParam("page"))

	result, err := lh.LogsService.GetLogs(c.Request().Context(), page)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (lh *LogsHandler) CreateLog(c echo.Context) error {
	var request contracts.CreateLogRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingFields := response.GetMissingRequestFields(request)
	if len(missingFields) > 0 {
		return response.Missing(c, response.SourceBody, missingFields...)
	}

	result, err := lh.LogsService.CreateLog(c.Request().Context(), &request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (lh *LogsHandler) DeleteLogs(c echo.Context) error {
	result, err := lh.LogsService.DeleteLogs(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (lh *LogsHandler) SearchLogs(c echo.Context) error {
	query := strings.TrimSpace(c.QueryParam("q"))
	page := strings.TrimSpace(c.QueryParam("page"))

	result, err := lh.LogsService.SearchLogs(c.Request().Context(), query, page)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}
