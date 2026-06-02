package handlers

import (
	"context"
	"net/http"
	"shopping-list/api-gateway/response"
	"shopping-list/shared/contracts"
	"strings"

	"github.com/labstack/echo/v4"
)

type CategoryModelService interface {
	TrainModel(ctx context.Context) (*contracts.TrainModelResponse, error)
	GetCategory(ctx context.Context, product string) (*contracts.GetCategoryResponse, error)
	CreateCategory(ctx context.Context, request *contracts.CreateCategoryRequest) (*contracts.CreateCategoryResponse, error)
}

func NewCategoryModelHandler(cms CategoryModelService) *CategoryModelHandler {
	return &CategoryModelHandler{CategoryModelService: cms}
}

type CategoryModelHandler struct {
	CategoryModelService CategoryModelService
}

func (cmh *CategoryModelHandler) TrainModel(c echo.Context) error {
	result, err := cmh.CategoryModelService.TrainModel(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (cmh *CategoryModelHandler) GetCategory(c echo.Context) error {
	product := strings.TrimSpace(c.QueryParam("product"))

	missingQueryParams := response.GetMissingQueryParams(c, "product")
	if len(missingQueryParams) > 0 {
		return response.Missing(c, response.SourceQuery, missingQueryParams...)
	}

	result, err := cmh.CategoryModelService.GetCategory(
		c.Request().Context(),
		product,
	)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (cmh *CategoryModelHandler) CreateCategory(c echo.Context) error {
	var request contracts.CreateCategoryRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingRequestFields := response.GetMissingRequestFields(request)
	if len(missingRequestFields) > 0 {
		return response.Missing(c, response.SourceBody, missingRequestFields...)
	}

	result, err := cmh.CategoryModelService.CreateCategory(
		c.Request().Context(),
		&request,
	)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}
