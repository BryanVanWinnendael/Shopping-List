package handlers

import (
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"shopping-list/storage/internal/config"
	"shopping-list/storage/models"
	"strings"

	"github.com/labstack/echo/v4"
)

type StorageService interface {
	DeleteStorage(recipeID string, category string) error
	SaveRecipesImage(file *multipart.FileHeader, recipeID string) (string, error)
	DeleteRecipesImage(recipeID string, url string) error
	SaveListImage(file *multipart.FileHeader, listID string) (string, error)
}

func NewStorageHandler(ss StorageService) *StorageHandler {
	return &StorageHandler{StorageServices: ss}
}

type StorageHandler struct {
	StorageServices StorageService
}

func (sh *StorageHandler) uploadImage(c echo.Context, category string) error {
	fileHeader, err := c.FormFile("image")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing or invalid image file"})
	}

	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing ID"})
	}

	var filePath string
	switch category {
	case "recipes":
		filePath, err = sh.StorageServices.SaveRecipesImage(fileHeader, id)
	case "list":
		filePath, err = sh.StorageServices.SaveListImage(fileHeader, id)
	default:
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Unknown category"})
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	host := config.Vars.HOST
	largeURL := fmt.Sprintf("%s%s", host, filePath)
	smallURL := fmt.Sprintf("%s%s", host, strings.Replace(filePath, "large-", "small-", 1))

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Image uploaded successfully",
		"large":   largeURL,
		"small":   smallURL,
	})
}

func (sh *StorageHandler) deleteImage(c echo.Context, category string) error {
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing ID"})
	}

	var request models.DeleteImageRequest
	if err := json.NewDecoder(c.Request().Body).Decode(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
	}
	if request.URL == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing URL"})
	}

	var err error
	switch category {
	case "recipes":
		err = sh.StorageServices.DeleteRecipesImage(id, request.URL)
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
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing ID"})
	}

	if category != "recipes" && category != "list" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid category"})
	}

	if err := sh.StorageServices.DeleteStorage(id, category); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": fmt.Sprintf("Deleted all images for %s %s", category, id),
	})
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
