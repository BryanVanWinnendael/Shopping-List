package services

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/disintegration/imaging"
)

func NewStorageService() *StorageService {
	return &StorageService{}
}

type StorageService struct{}

func (s *StorageService) saveImage(fileHeader *multipart.FileHeader, category, itemID string) (string, error) {
	src, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	dirPath := filepath.Join("storage", category, "images", itemID)
	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		return "", fmt.Errorf("failed to create directory: %v", err)
	}

	img, format, err := image.Decode(src)
	if err != nil {
		return "", fmt.Errorf("invalid image: %v", err)
	}

	format = strings.ToLower(format)
	if format != "jpeg" && format != "png" && format != "jpg" {
		format = "jpeg"
	}

	timestamp := time.Now().Unix()
	baseName := fmt.Sprintf("%d-%s", timestamp, fileHeader.Filename)

	small := imaging.Resize(img, 200, 0, imaging.Lanczos)
	smallPath := filepath.Join(dirPath, "small-"+baseName)
	if err := imaging.Save(small, smallPath, imaging.JPEGQuality(40)); err != nil {
		return "", fmt.Errorf("failed to save small image: %v", err)
	}

	large := imaging.Fit(img, 1600, 1600, imaging.Lanczos)
	var buf bytes.Buffer
	quality := 90
	for {
		buf.Reset()
		if err := jpeg.Encode(&buf, large, &jpeg.Options{Quality: quality}); err != nil {
			return "", fmt.Errorf("JPEG encode failed: %v", err)
		}
		if buf.Len() <= MaxLargeSizeBytes || quality <= 50 {
			break
		}
		quality -= 5
	}

	largePath := filepath.Join(dirPath, "large-"+baseName)
	if err := os.WriteFile(largePath, buf.Bytes(), 0644); err != nil {
		return "", fmt.Errorf("failed to save large image: %v", err)
	}

	return "/" + largePath, nil
}

func (s *StorageService) deleteImage(category, itemID, imageURL string) error {
	prefix := fmt.Sprintf("/storage/%s/images/", category)
	parts := strings.SplitN(imageURL, prefix, 2)
	if len(parts) != 2 {
		return fmt.Errorf("invalid URL: must contain %s", prefix)
	}

	relativePath := parts[1]
	fullPath := filepath.Join("storage", category, "images", relativePath)

	if !strings.Contains(fullPath, filepath.Join("images", itemID)) {
		return fmt.Errorf("image does not belong to %s %s", category, itemID)
	}

	if err := os.Remove(fullPath); err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("file not found")
		}
		return fmt.Errorf("failed to delete image: %v", err)
	}

	if strings.Contains(fullPath, "large-") {
		os.Remove(strings.Replace(fullPath, "large-", "small-", 1))
	} else if strings.Contains(fullPath, "small-") {
		os.Remove(strings.Replace(fullPath, "small-", "large-", 1))
	}

	return nil
}

func (s *StorageService) DeleteStorage(recipeID string, category string) error {
	dirPath := filepath.Join("storage", category, "images", recipeID)
	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		return fmt.Errorf("no storage found for recipe %s", recipeID)
	}
	return os.RemoveAll(dirPath)
}

func (s *StorageService) SaveRecipesImage(file *multipart.FileHeader, recipeID string) (string, error) {
	return s.saveImage(file, "recipes", recipeID)
}

func (s *StorageService) DeleteRecipesImage(recipeID, imageURL string) error {
	return s.deleteImage("recipes", recipeID, imageURL)
}

func (s *StorageService) SaveListImage(file *multipart.FileHeader, listID string) (string, error) {
	return s.saveImage(file, "list", listID)
}
