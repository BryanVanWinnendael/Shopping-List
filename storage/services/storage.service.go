package services

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"mime/multipart"
	"net/url"
	"os"
	"path/filepath"
	"shopping-list/storage/internal/config"
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

	dirName := strings.TrimPrefix(config.Vars.StorageDir, "./")
	dirPath := filepath.Join(dirName, category, "images", itemID)
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
	u, err := url.Parse(imageURL)
	if err != nil {
		return fmt.Errorf("invalid URL: %v", err)
	}

	localPath := filepath.FromSlash(strings.TrimPrefix(u.Path, "/"))

	dirName := strings.TrimPrefix(config.Vars.StorageDir, "./")
	prefix := filepath.Join(dirName, category, "images")

	relPath, err := filepath.Rel(prefix, localPath)
	if err != nil || strings.HasPrefix(relPath, "..") {
		return fmt.Errorf("invalid URL: must be inside %s", prefix)
	}

	if !strings.Contains(relPath, itemID) {
		return fmt.Errorf("image does not belong to %s %s", category, itemID)
	}

	fullPath := filepath.Join(prefix, relPath)

	if err := os.Remove(fullPath); err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("file not found: %s", fullPath)
		}
		return fmt.Errorf("failed to delete image: %v", err)
	}

	base := filepath.Base(fullPath)
	dir := filepath.Dir(fullPath)
	switch {
	case strings.HasPrefix(base, "large-"):
		os.Remove(filepath.Join(dir, strings.Replace(base, "large-", "small-", 1)))
	case strings.HasPrefix(base, "small-"):
		os.Remove(filepath.Join(dir, strings.Replace(base, "small-", "large-", 1)))
	}

	return nil
}

func (s *StorageService) DeleteStorage(recipeID string, category string) error {
	dirName := strings.TrimPrefix(config.Vars.StorageDir, "./")
	dirPath := filepath.Join(dirName, category, "images", recipeID)
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
