package services

import (
	"context"
	"fmt"
	"mime/multipart"
	"net/http"
	httphelper "shopping-list/api-gateway/http-helper"
	"shopping-list/api-gateway/models"
)

type StorageService struct {
	client  *httphelper.Client
	baseURL string
}

func NewStorageService(client *httphelper.Client, baseURL string) *StorageService {
	return &StorageService{
		client:  client,
		baseURL: baseURL,
	}
}

func (ss *StorageService) UploadRecipesImage(ctx context.Context, recipeID string, file *multipart.FileHeader) (models.UploadImageResponse, error) {
	requestUrl := fmt.Sprintf("%s/recipes/images/%s", ss.baseURL, recipeID)

	var response models.UploadImageResponse

	_, err := ss.client.DoMultipartRequest(
		ctx,
		http.MethodPost,
		requestUrl,
		"image",
		file,
		nil,
		&response,
	)

	if err != nil {
		return models.UploadImageResponse{}, err
	}

	return response, nil
}

func (ss *StorageService) DeleteRecipesImage(ctx context.Context, recipeID string, request models.DeleteImageRequest) error {
	requestUrl := fmt.Sprintf("%s/recipes/images/%s", ss.baseURL, recipeID)

	_, err := ss.client.DoRequest(
		ctx,
		http.MethodDelete,
		requestUrl,
		nil,
		request,
		nil,
	)

	return err
}

func (ss *StorageService) DeleteRecipeStorage(ctx context.Context, recipeID string) error {
	requestUrl := fmt.Sprintf("%s/recipes/%s", ss.baseURL, recipeID)

	_, err := ss.client.DoRequest(
		ctx,
		http.MethodDelete,
		requestUrl,
		nil,
		nil,
		nil,
	)

	return err
}

func (ss *StorageService) UploadListImage(ctx context.Context, itemID string, file *multipart.FileHeader) (models.UploadImageResponse, error) {
	requestUrl := fmt.Sprintf("%s/list/images/%s", ss.baseURL, itemID)

	var response models.UploadImageResponse

	_, err := ss.client.DoMultipartRequest(
		ctx,
		http.MethodPost,
		requestUrl,
		"image",
		file,
		nil,
		&response,
	)

	if err != nil {
		return models.UploadImageResponse{}, err
	}

	return response, nil
}

func (ss *StorageService) DeleteListImage(ctx context.Context, itemID string) error {
	requestUrl := fmt.Sprintf("%s/list/images/%s", ss.baseURL, itemID)

	_, err := ss.client.DoRequest(
		ctx,
		http.MethodDelete,
		requestUrl,
		nil,
		nil,
		nil,
	)

	return err
}
