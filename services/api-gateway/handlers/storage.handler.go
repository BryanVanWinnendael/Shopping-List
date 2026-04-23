package handlers

import (
	"context"
	"mime/multipart"
	"net/http"
	"shopping-list/api-gateway/models"
	"shopping-list/api-gateway/response"

	"github.com/labstack/echo/v4"
)

type StorageService interface {
	UploadRecipeImage(ctx context.Context, recipeID string, file *multipart.FileHeader) (models.UploadImageResponse, error)
	DeleteRecipeImage(ctx context.Context, recipeID string, request models.DeleteImageRequest) error
	DeleteRecipeStorage(ctx context.Context, recipeID string) error
	UploadListImage(ctx context.Context, itemID string, file *multipart.FileHeader) (models.UploadImageResponse, error)
	DeleteListImage(ctx context.Context, itemID string) error
}

func NewStorageHandler(ls StorageService) *StorageHandler {
	return &StorageHandler{StorageService: ls}
}

type StorageHandler struct {
	StorageService StorageService
}

func (sh *StorageHandler) UploadRecipeImage(c echo.Context) error {
	recipesID := c.Param("recipesID")

	missingPathParams := response.GetMissingPathParams(c, "recipesID")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	fileHeader, err := c.FormFile("image")
	if err != nil {
		return response.Missing(c, response.SourceImage, "image")
	}

	result, err := sh.StorageService.UploadRecipeImage(c.Request().Context(), recipesID, fileHeader)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (sh *StorageHandler) DeleteRecipeImage(c echo.Context) error {
	recipesID := c.Param("recipesID")

	missingPathParams := response.GetMissingPathParams(c, "recipesID")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	var request models.DeleteImageRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingRequestFields := response.GetMissingRequestFields(request)
	if len(missingRequestFields) > 0 {
		return response.Missing(c, response.SourceBody, missingRequestFields...)
	}

	err := sh.StorageService.DeleteRecipeImage(c.Request().Context(), recipesID, request)

	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, "Image deleted successfully")
}

func (sh *StorageHandler) DeleteRecipeStorage(c echo.Context) error {
	recipesID := c.Param("recipesID")

	missingPathParams := response.GetMissingPathParams(c, "recipesID")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	err := sh.StorageService.DeleteRecipeStorage(c.Request().Context(), recipesID)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, "Recipe storage deleted successfully")
}

func (sh *StorageHandler) UploadListImage(c echo.Context) error {
	itemID := c.Param("itemID")

	missingPathParams := response.GetMissingPathParams(c, "itemID")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	fileHeader, err := c.FormFile("image")
	if err != nil {
		return response.Missing(c, response.SourceImage, "image")
	}

	result, err := sh.StorageService.UploadListImage(c.Request().Context(), itemID, fileHeader)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (sh *StorageHandler) DeleteListImage(c echo.Context) error {
	itemID := c.Param("itemID")

	missingPathParams := response.GetMissingPathParams(c, "itemID")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	err := sh.StorageService.DeleteListImage(c.Request().Context(), itemID)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, "Image deleted successfully")
}
