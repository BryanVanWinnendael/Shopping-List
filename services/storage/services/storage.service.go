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

	"shopping-list/storage/internal/config"

	"github.com/disintegration/imaging"
)

const (
	MaxLargeSizeBytes = 1 * 1024 * 1024 // 1 MB
	ThumbnailWidth    = 200
	MaxLargeDimension = 1600
	StartJPEGQuality  = 90
	MinJPEGQuality    = 50
)

type StorageService struct{}

func NewStorageService() *StorageService {
	return &StorageService{}
}

func (s *StorageService) UploadRecipeImage(file *multipart.FileHeader, recipeID string) (string, string, error) {
	return s.uploadImage(file, "recipes", recipeID)
}

func (s *StorageService) DeleteRecipeImage(recipeID, imageURL string) error {
	return s.deleteImage("recipes", recipeID, imageURL)
}

func (s *StorageService) UploadListImage(file *multipart.FileHeader, listID string) (string, string, error) {
	return s.uploadImage(file, "list", listID)
}

func (s *StorageService) DeleteStorage(itemID string, category string) error {
	dirPath := filepath.Join(config.Vars.StorageDir, category, "images", itemID)

	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		return fmt.Errorf("no storage found for %s %s", category, itemID)
	}

	return os.RemoveAll(dirPath)
}

func (s *StorageService) uploadImage(fileHeader *multipart.FileHeader, category, itemID string) (string, string, error) {
	src, err := fileHeader.Open()
	if err != nil {
		return "", "", err
	}
	defer func() {
		if err := src.Close(); err != nil {
			fmt.Println("failed to close file:", err)
		}
	}()

	img, _, err := image.Decode(src)
	if err != nil {
		return "", "", fmt.Errorf("invalid image: %w", err)
	}

	dirPath := filepath.Join(config.Vars.StorageDir, category, "images", itemID)
	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		return "", "", fmt.Errorf("failed to create directory: %w", err)
	}

	timestamp := time.Now().Unix()
	fileName := sanitizeFileName(fileHeader.Filename)
	baseName := fmt.Sprintf("%d-%s", timestamp, fileName)

	smallImg := imaging.Resize(img, ThumbnailWidth, 0, imaging.Lanczos)
	smallFile := "small-" + baseName
	smallPath := filepath.Join(dirPath, smallFile)

	if err := imaging.Save(smallImg, smallPath, imaging.JPEGQuality(40)); err != nil {
		return "", "", fmt.Errorf("failed to upload small image: %w", err)
	}

	largeImg := imaging.Fit(img, MaxLargeDimension, MaxLargeDimension, imaging.Lanczos)

	var buf bytes.Buffer
	quality := StartJPEGQuality

	for {
		buf.Reset()

		err := jpeg.Encode(&buf, largeImg, &jpeg.Options{Quality: quality})
		if err != nil {
			return "", "", fmt.Errorf("jpeg encode failed: %w", err)
		}

		if buf.Len() <= MaxLargeSizeBytes || quality <= MinJPEGQuality {
			break
		}

		quality -= 5
	}

	largeFile := "large-" + baseName
	largePath := filepath.Join(dirPath, largeFile)

	if err := os.WriteFile(largePath, buf.Bytes(), 0644); err != nil {
		return "", "", fmt.Errorf("failed to upload large image: %w", err)
	}

	host := strings.TrimRight(config.Vars.Host, "/")
	smallURL := fmt.Sprintf("%s/%s",
		host,
		filepath.ToSlash(filepath.Join(category, "images", itemID, smallFile)),
	)
	largeURL := fmt.Sprintf("%s/%s",
		host,
		filepath.ToSlash(filepath.Join(category, "images", itemID, largeFile)),
	)

	return smallURL, largeURL, nil
}

func (s *StorageService) deleteImage(category, itemID, imageURL string) error {
	host := strings.TrimRight(config.Vars.Host, "/") + "/"
	if !strings.HasPrefix(imageURL, host) {
		return fmt.Errorf("invalid URL")
	}

	relativePath := strings.TrimPrefix(imageURL, host)
	fullPath := filepath.Join(config.Vars.StorageDir, relativePath)
	expectedDir := filepath.Join(config.Vars.StorageDir, category, "images", itemID)

	if !strings.HasPrefix(fullPath, expectedDir) {
		return fmt.Errorf("image does not belong to %s %s", category, itemID)
	}

	if err := os.Remove(fullPath); err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("file not found")
		}
		return fmt.Errorf("failed to delete image: %w", err)
	}

	var counterpart string

	if strings.Contains(fullPath, "large-") {
		counterpart = strings.Replace(fullPath, "large-", "small-", 1)
	} else if strings.Contains(fullPath, "small-") {
		counterpart = strings.Replace(fullPath, "small-", "large-", 1)
	}

	if counterpart != "" {
		if err := os.Remove(counterpart); err != nil && !os.IsNotExist(err) {
			fmt.Println("Failed to remove counterpart:", err)
		}
	}

	return nil
}

func sanitizeFileName(name string) string {
	name = strings.ReplaceAll(name, " ", "_")
	return filepath.Base(name)
}
