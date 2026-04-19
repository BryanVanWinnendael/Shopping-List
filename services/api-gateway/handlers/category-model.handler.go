package handlers

import (
	"context"
	"net/http"
	"shopping-list/api-gateway/models"
	"shopping-list/api-gateway/response"
	"strings"

	"github.com/labstack/echo/v4"
)

type CategoryModelService interface {
	TrainModel(ctx context.Context) (*models.TrainModelResponse, error)
	GetCategory(ctx context.Context, item string) (*models.CategoryResponse, error)
	AddCategory(ctx context.Context, request models.AddCategoryRequest) (*models.AddCategoryResponse, error)
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
	item := strings.TrimSpace(c.QueryParam("item"))

	missingQueryParams := response.GetMissingQueryParams(c, "item")
	if len(missingQueryParams) > 0 {
		return response.Missing(c, response.SourceQuery, missingQueryParams...)
	}

	result, err := cmh.CategoryModelService.GetCategory(
		c.Request().Context(),
		item,
	)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (cmh *CategoryModelHandler) AddCategory(c echo.Context) error {
	var request models.AddCategoryRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingRequestFields := response.GetMissingRequestFields(request)
	if len(missingRequestFields) > 0 {
		return response.Missing(c, response.SourceBody, missingRequestFields...)
	}

	result, err := cmh.CategoryModelService.AddCategory(
		c.Request().Context(),
		request,
	)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}
