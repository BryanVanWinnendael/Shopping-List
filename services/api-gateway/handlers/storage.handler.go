package handlers

import (
	"context"
	"mime/multipart"
	"net/http"
	"shopping-list/api-gateway/response"
	"shopping-list/shared/contracts"

	"github.com/labstack/echo/v4"
)

type StorageService interface {
	UploadRecipeImage(ctx context.Context, id string, fileHeader *multipart.FileHeader) (*contracts.UploadImageResponse, error)
	DeleteRecipeImage(ctx context.Context, id string, request *contracts.DeleteImageRequest) (*contracts.DeleteImageResponse, error)
	DeleteRecipeStorage(ctx context.Context, id string) (*contracts.DeleteStorageResponse, error)
	UploadListImage(ctx context.Context, id string, fileHeader *multipart.FileHeader) (*contracts.UploadImageResponse, error)
	DeleteListImage(ctx context.Context, id string) (*contracts.DeleteImageResponse, error)
	GetBackup(ctx context.Context) (*http.Response, error)
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

	result, err := sh.StorageService.UploadRecipeImage(c.Request().Context(), id, fileHeader)
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

	result, err := sh.StorageService.UploadListImage(c.Request().Context(), id, fileHeader)
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
