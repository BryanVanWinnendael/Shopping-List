package services

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"os"
	"path/filepath"
	"shopping-list/shared/contracts"
	"strings"
	"time"

	"shopping-list/storage/internal/config"

	"github.com/disintegration/imaging"
	"github.com/google/uuid"
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

func (s *StorageService) UploadRecipeImage(request *contracts.UploadImageRequest, recipeID string) (*contracts.UploadImageResponse, error) {
	smallUrl, largeUrl, err := s.uploadImage(request, recipeID, "recipes")
	if err != nil {
		return nil, err
	}
	return &contracts.UploadImageResponse{
		Small: smallUrl,
		Large: largeUrl,
	}, nil
}

func (s *StorageService) DeleteRecipeImage(recipeID string, url string) (*contracts.DeleteRecipeResponse, error) {
	err := s.deleteImage(url, recipeID, "recipes")
	if err != nil {
		return nil, err
	}
	return &contracts.DeleteRecipeResponse{
		Id:      recipeID,
		Message: "recipe image deleted successfully",
	}, nil
}

func (s *StorageService) UploadListImage(request *contracts.UploadImageRequest, listID string) (*contracts.UploadImageResponse, error) {
	smallUrl, largeUrl, err := s.uploadImage(request, listID, "list")
	if err != nil {
		return nil, err
	}
	return &contracts.UploadImageResponse{
		Small: smallUrl,
		Large: largeUrl,
	}, nil
}

func (s *StorageService) DeleteStorage(id string, category string) (*contracts.DeleteStorageResponse, error) {
	dirPath := filepath.Join(config.Vars.StorageDir, category, "images", id)

	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		return &contracts.DeleteStorageResponse{
			Id:      id,
			Message: "storage not found",
		}, nil
	}
	err := os.RemoveAll(dirPath)
	if err != nil {
		return nil, err
	}

	return &contracts.DeleteStorageResponse{
		Id:      id,
		Message: "storage deleted successfully",
	}, nil
}

func (s *StorageService) uploadImage(request *contracts.UploadImageRequest, id, category string) (string, string, error) {
	src, err := request.Image.Open()
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

	dirPath := filepath.Join(config.Vars.StorageDir, category, "images", id)
	fmt.Println("uploading image", id, "to", dirPath)
	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		return "", "", fmt.Errorf("failed to create directory: %w", err)
	}

	uniqueID := uuid.New().String()
	fileName := sanitizeFileName(request.Image.Filename)
	baseName := fmt.Sprintf("%d-%s-%s", time.Now().Unix(), uniqueID, fileName)

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
		filepath.ToSlash(filepath.Join(category, "images", id, smallFile)),
	)
	largeURL := fmt.Sprintf("%s/%s",
		host,
		filepath.ToSlash(filepath.Join(category, "images", id, largeFile)),
	)

	return smallURL, largeURL, nil
}

func (s *StorageService) deleteImage(url, id, category string) error {
	host := strings.TrimRight(config.Vars.Host, "/") + "/"
	if !strings.HasPrefix(url, host) {
		return fmt.Errorf("invalid URL")
	}

	relativePath := strings.TrimPrefix(url, host)
	fullPath := filepath.Join(config.Vars.StorageDir, relativePath)
	expectedDir := filepath.Join(config.Vars.StorageDir, category, "images", id)

	if !strings.HasPrefix(fullPath, expectedDir) {
		return fmt.Errorf("image does not belong to %s %s", category, id)
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
			fmt.Println("failed to remove counterpart:", err)
		}
	}

	return nil
}

func sanitizeFileName(name string) string {
	name = strings.ReplaceAll(name, " ", "_")
	return filepath.Base(name)
}
