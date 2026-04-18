package handlers

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"shopping-list/storage/internal/config"
	"shopping-list/storage/models"
	"strings"

	"github.com/labstack/echo/v4"
)

type StorageService interface {
	DeleteStorage(itemID string, category string) error
	SaveRecipesImage(file *multipart.FileHeader, recipeID string) (string, string, error)
	DeleteRecipesImage(recipeID string, url string) error
	SaveListImage(file *multipart.FileHeader, listID string) (string, string, error)
}

type StorageHandler struct {
	storageService StorageService
}

func NewStorageHandler(ss StorageService) *StorageHandler {
	return &StorageHandler{storageService: ss}
}

func (sh *StorageHandler) UploadRecipesImage(c echo.Context) error {
	return sh.uploadImage(c, "recipes")
}

func (sh *StorageHandler) DeleteRecipesImage(c echo.Context) error {
	return sh.deleteImage(c, "recipes")
}

func (sh *StorageHandler) DeleteRecipesStorage(c echo.Context) error {
	return sh.deleteStorage(c, "recipes")
}

func (sh *StorageHandler) UploadListImage(c echo.Context) error {
	return sh.uploadImage(c, "list")
}

func (sh *StorageHandler) DeleteListImage(c echo.Context) error {
	return sh.deleteStorage(c, "list")
}

func (sh *StorageHandler) uploadImage(c echo.Context, category string) error {
	if !isValidCategory(category) {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid Category"})
	}

	fileHeader, err := c.FormFile("image")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing or invalid image file"})
	}

	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing ID"})
	}

	var smallURL, largeURL string

	switch category {
	case "recipes":
		smallURL, largeURL, err = sh.storageService.SaveRecipesImage(fileHeader, id)
	case "list":
		smallURL, largeURL, err = sh.storageService.SaveListImage(fileHeader, id)
	default:
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Unknown category"})
	}

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Image uploaded successfully",
		"large":   largeURL,
		"small":   smallURL,
	})
}

func (sh *StorageHandler) deleteImage(c echo.Context, category string) error {
	if !isValidCategory(category) {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid Category"})
	}

	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing ID"})
	}

	var request models.DeleteImageRequest
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
	}

	if request.URL == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing URL"})
	}

	if !isInternalURL(request.URL) {
		return c.JSON(http.StatusOK, map[string]string{
			"message": "Image is not stored in the configured storage",
		})
	}

	var err error

	switch category {
	case "recipes":
		err = sh.storageService.DeleteRecipesImage(id, request.URL)
	case "list":
		return c.JSON(http.StatusNotImplemented, map[string]string{"error": "List image deletion not implemented"})
	default:
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Unknown category"})
	}

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": fmt.Sprintf("Image for %s %s deleted successfully", category, id),
	})
}

func (sh *StorageHandler) deleteStorage(c echo.Context, category string) error {
	if !isValidCategory(category) {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid Category"})
	}

	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing ID"})
	}

	if err := sh.storageService.DeleteStorage(id, category); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": fmt.Sprintf("Deleted all images for %s %s", category, id),
	})
}

func isValidCategory(category string) bool {
	return category == "recipes" || category == "list"
}

func isInternalURL(url string) bool {
	host := strings.TrimRight(config.Vars.Host, "/")
	return strings.HasPrefix(url, host+"/")
}
