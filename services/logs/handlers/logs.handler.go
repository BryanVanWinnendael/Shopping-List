package handlers

import (
	"net/http"
	"shopping-list/shared/contracts"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
)

type LogsService interface {
	GetLogs(page int) (*contracts.GetLogsResponse, error)
	SearchLogs(query string, page int) (*contracts.SearchLogsResponse, error)
	CreateLog(request *contracts.CreateLogRequest) (*contracts.CreateLogResponse, error)
	DeleteLogs() (*contracts.DeleteLogResponse, error)
}

func NewLogsHandler(ls LogsService) *LogsHandler {
	return &LogsHandler{LogsService: ls}
}

type LogsHandler struct {
	LogsService LogsService
}

func (lh *LogsHandler) GetLogs(c echo.Context) error {
	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil || page < 1 {
		page = 1
	}

	result, err := lh.LogsService.GetLogs(page)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}

func (lh *LogsHandler) CreateLog(c echo.Context) error {
	var request contracts.CreateLogRequest
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

	result, err := lh.LogsService.CreateLog(&request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}

func (lh *LogsHandler) DeleteLogs(c echo.Context) error {
	result, err := lh.LogsService.DeleteLogs()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}

func (lh *LogsHandler) SearchLogs(c echo.Context) error {
	query := strings.TrimSpace(c.QueryParam("q"))

	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil || page < 1 {
		page = 1
	}

	result, err := lh.LogsService.SearchLogs(query, page)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}
