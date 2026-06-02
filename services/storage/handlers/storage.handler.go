package handlers

import (
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/storage/internal/config"
	"strings"

	"github.com/labstack/echo/v4"
)

type StorageService interface {
	DeleteStorage(itemID string, category string) (*contracts.DeleteStorageResponse, error)
	UploadRecipeImage(request *contracts.UploadImageRequest, recipeID string) (*contracts.UploadImageResponse, error)
	DeleteRecipeImage(recipeID string, url string) (*contracts.DeleteRecipeResponse, error)
	UploadListImage(request *contracts.UploadImageRequest, listID string) (*contracts.UploadImageResponse, error)
}

type StorageHandler struct {
	StorageService StorageService
}

func NewStorageHandler(ss StorageService) *StorageHandler {
	return &StorageHandler{StorageService: ss}
}

func (sh *StorageHandler) UploadRecipeImage(c echo.Context) error {
	return sh.uploadImage(c, "recipes")
}

func (sh *StorageHandler) DeleteRecipeImage(c echo.Context) error {
	return sh.deleteImage(c, "recipes")
}

func (sh *StorageHandler) DeleteRecipeStorage(c echo.Context) error {
	return sh.deleteStorage(c, "recipes")
}

func (sh *StorageHandler) UploadListImage(c echo.Context) error {
	return sh.uploadImage(c, "list")
}

func (sh *StorageHandler) DeleteListImage(c echo.Context) error {
	return sh.deleteStorage(c, "list")
}

func (sh *StorageHandler) uploadImage(c echo.Context, category string) error {
	fileHeader, err := c.FormFile("image")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing or invalid image file"})
	}
	request := contracts.UploadImageRequest{Image: fileHeader}

	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing Id"})
	}

	if category == "recipes" {
		result, err := sh.StorageService.UploadRecipeImage(&request, id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, result)
	} else if category == "list" {
		result, err := sh.StorageService.UploadListImage(&request, id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, result)
	}

	return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid category"})
}

func (sh *StorageHandler) deleteImage(c echo.Context, category string) error {
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing Id"})
	}

	var request contracts.DeleteImageRequest
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
	}

	if request.URL == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing Url"})
	}

	if !isInternalURL(request.URL) {
		return c.JSON(http.StatusOK, map[string]string{
			"message": "image is not stored in the configured storage",
		})
	}

	if category != "recipes" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid category"})
	}

	result, err := sh.StorageService.DeleteRecipeImage(id, request.URL)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

func (sh *StorageHandler) deleteStorage(c echo.Context, category string) error {
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing Id"})
	}

	result, err := sh.StorageService.DeleteStorage(id, category)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

func isInternalURL(url string) bool {
	host := strings.TrimRight(config.Vars.Host, "/")
	return strings.HasPrefix(url, host+"/")
}
