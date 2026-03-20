package handlers

import (
	"context"
	"net/http"
	"shopping-list/api-gateway/models"
	"shopping-list/api-gateway/response"

	"github.com/labstack/echo/v4"
)

type CronService interface {
	CreateCronItem(ctx context.Context, request *models.CreateCronItemRequest) (*models.CronItem, error)
	GetAllCronItems(ctx context.Context) ([]models.CronItem, error)
	DeleteCronItem(ctx context.Context, itemID string) error
	GetCronItemsByUser(ctx context.Context, user string) ([]models.CronItem, error)
	UpdateCronItemCategory(ctx context.Context, itemID string, request models.UpdateCronItemRequest) error
}

func NewCronHandler(ls CronService) *CronHandler {
	return &CronHandler{CronService: ls}
}

type CronHandler struct {
	CronService CronService
}

func (ch *CronHandler) CreateCronItem(c echo.Context) error {
	var request models.CreateCronItemRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingFields := response.GetMissingRequestFields(request)
	if len(missingFields) > 0 {
		return response.Missing(c, response.SourceBody, missingFields...)
	}

	result, err := ch.CronService.CreateCronItem(c.Request().Context(), &request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (ch *CronHandler) GetAllCronItems(c echo.Context) error {
	items, err := ch.CronService.GetAllCronItems(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, items)
}

func (ch *CronHandler) DeleteCronItem(c echo.Context) error {
	itemID := c.Param("itemID")

	missingPathParams := response.GetMissingPathParams(c, "itemID")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	err := ch.CronService.DeleteCronItem(c.Request().Context(), itemID)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, "Cron item deleted successfully")
}

func (ch *CronHandler) GetCronItemsByUser(c echo.Context) error {
	user := c.Param("user")

	missingPathParams := response.GetMissingPathParams(c, "user")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	result, err := ch.CronService.GetCronItemsByUser(c.Request().Context(), user)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (ch *CronHandler) UpdateCronItemCategory(c echo.Context) error {
	itemID := c.Param("itemID")

	missingPathParams := response.GetMissingPathParams(c, "itemID")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	var request models.UpdateCronItemRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingRequestFields := response.GetMissingRequestFields(request)
	if len(missingRequestFields) > 0 {
		return response.Missing(c, response.SourceBody, missingRequestFields...)
	}

	err := ch.CronService.UpdateCronItemCategory(c.Request().Context(), itemID, request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, "Cron item category updated successfully")
}
