package handlers

import (
	"context"
	"net/http"
	"shopping-list/api-gateway/response"
	"shopping-list/shared/contracts"

	"github.com/labstack/echo/v4"
)

type StorageService interface {
	UploadRecipeImage(ctx context.Context, id string, request *contracts.UploadImageRequest) (*contracts.UploadImageResponse, error)
	DeleteRecipeImage(ctx context.Context, id string, request *contracts.DeleteImageRequest) (*contracts.DeleteImageResponse, error)
	DeleteRecipeStorage(ctx context.Context, id string) (*contracts.DeleteStorageResponse, error)
	UploadListImage(ctx context.Context, id string, request *contracts.UploadImageRequest) (*contracts.UploadImageResponse, error)
	DeleteListImage(ctx context.Context, id string) (*contracts.DeleteImageResponse, error)
}

func NewStorageHandler(ls StorageService) *StorageHandler {
	return &StorageHandler{StorageService: ls}
}

type StorageHandler struct {
	StorageService StorageService
}

func (sh *StorageHandler) UploadRecipeImage(c echo.Context) error {
	id := c.Param("id")

	missingPathParams := response.GetMissingPathParams(c, "id")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	fileHeader, err := c.FormFile("image")
	if err != nil {
		return response.Missing(c, response.SourceImage, "image")
	}
	request := contracts.UploadImageRequest{Image: fileHeader}

	result, err := sh.StorageService.UploadRecipeImage(c.Request().Context(), id, &request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (sh *StorageHandler) DeleteRecipeImage(c echo.Context) error {
	id := c.Param("id")

	missingPathParams := response.GetMissingPathParams(c, "id")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	var request contracts.DeleteImageRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingRequestFields := response.GetMissingRequestFields(request)
	if len(missingRequestFields) > 0 {
		return response.Missing(c, response.SourceBody, missingRequestFields...)
	}

	result, err := sh.StorageService.DeleteRecipeImage(c.Request().Context(), id, &request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (sh *StorageHandler) DeleteRecipeStorage(c echo.Context) error {
	id := c.Param("id")

	missingPathParams := response.GetMissingPathParams(c, "id")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	result, err := sh.StorageService.DeleteRecipeStorage(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (sh *StorageHandler) UploadListImage(c echo.Context) error {
	id := c.Param("id")

	missingPathParams := response.GetMissingPathParams(c, "id")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	fileHeader, err := c.FormFile("image")
	if err != nil {
		return response.Missing(c, response.SourceImage, "image")
	}
	request := contracts.UploadImageRequest{Image: fileHeader}

	result, err := sh.StorageService.UploadListImage(c.Request().Context(), id, &request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (sh *StorageHandler) DeleteListImage(c echo.Context) error {
	id := c.Param("id")

	missingPathParams := response.GetMissingPathParams(c, "id")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	result, err := sh.StorageService.DeleteListImage(c.Request().Context(), id)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}
