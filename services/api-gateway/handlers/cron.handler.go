package handlers

import (
	"context"
	"net/http"
	"shopping-list/api-gateway/response"
	"shopping-list/shared/contracts"

	"github.com/labstack/echo/v4"
)

type CronService interface {
	CreateCronProduct(ctx context.Context, request *contracts.CreateCronProductRequest) (*contracts.CreateCronProductResponse, error)
	GetAllCronProducts(ctx context.Context) (*contracts.GetAllCronProductsResponse, error)
	DeleteCronProduct(ctx context.Context, id string) (*contracts.DeleteCronProductResponse, error)
	GetCronProductsByUser(ctx context.Context, user string) (*contracts.GetCronProductsByUserResponse, error)
	UpdateCronProductCategory(ctx context.Context, id string, request *contracts.UpdateCronProductCategoryRequest) (*contracts.UpdateCronProductCategoryResponse, error)
}

type CronHandler struct {
	CronService CronService
}

func NewCronHandler(cs CronService) *CronHandler {
	return &CronHandler{CronService: cs}
}

func (ch *CronHandler) CreateCronProduct(c echo.Context) error {
	var request contracts.CreateCronProductRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingFields := response.GetMissingRequestFields(request)
	if len(missingFields) > 0 {
		return response.Missing(c, response.SourceBody, missingFields...)
	}

	result, err := ch.CronService.CreateCronProduct(c.Request().Context(), &request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (ch *CronHandler) GetAllCronProducts(c echo.Context) error {
	result, err := ch.CronService.GetAllCronProducts(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (ch *CronHandler) DeleteCronProduct(c echo.Context) error {
	id := c.Param("id")

	missingPathParams := response.GetMissingPathParams(c, "id")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	result, err := ch.CronService.DeleteCronProduct(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (ch *CronHandler) GetCronProductsByUser(c echo.Context) error {
	user := c.Param("user")

	missingPathParams := response.GetMissingPathParams(c, "user")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	result, err := ch.CronService.GetCronProductsByUser(c.Request().Context(), user)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (ch *CronHandler) UpdateCronProductCategory(c echo.Context) error {
	id := c.Param("id")

	missingPathParams := response.GetMissingPathParams(c, "id")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	var request contracts.UpdateCronProductCategoryRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingRequestFields := response.GetMissingRequestFields(request)
	if len(missingRequestFields) > 0 {
		return response.Missing(c, response.SourceBody, missingRequestFields...)
	}

	result, err := ch.CronService.UpdateCronProductCategory(c.Request().Context(), id, &request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}
