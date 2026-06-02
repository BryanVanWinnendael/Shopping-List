package services

import (
	"context"
	"fmt"
	"net/http"
	"shopping-list/shared/contracts"
	httphelper "shopping-list/shared/http"
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

func (ss *StorageService) UploadRecipeImage(ctx context.Context, id string, request *contracts.UploadImageRequest) (*contracts.UploadImageResponse, error) {
	requestUrl := fmt.Sprintf("%s/recipes/images/%s", ss.baseURL, id)

	var response contracts.UploadImageResponse

	_, err := ss.client.DoMultipartRequest(
		ctx,
		http.MethodPost,
		requestUrl,
		"image",
		request.Image,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (ss *StorageService) DeleteRecipeImage(ctx context.Context, id string, request *contracts.DeleteImageRequest) (*contracts.DeleteImageResponse, error) {
	requestUrl := fmt.Sprintf("%s/recipes/images/%s", ss.baseURL, id)

	var response contracts.DeleteImageResponse

	_, err := ss.client.DoRequest(
		ctx,
		http.MethodDelete,
		requestUrl,
		nil,
		request,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (ss *StorageService) DeleteRecipeStorage(ctx context.Context, id string) (*contracts.DeleteStorageResponse, error) {
	requestUrl := fmt.Sprintf("%s/recipes/%s", ss.baseURL, id)

	var response contracts.DeleteStorageResponse

	_, err := ss.client.DoRequest(
		ctx,
		http.MethodDelete,
		requestUrl,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (ss *StorageService) UploadListImage(ctx context.Context, id string, request *contracts.UploadImageRequest) (*contracts.UploadImageResponse, error) {
	requestUrl := fmt.Sprintf("%s/list/images/%s", ss.baseURL, id)

	var response contracts.UploadImageResponse

	_, err := ss.client.DoMultipartRequest(
		ctx,
		http.MethodPost,
		requestUrl,
		"image",
		request.Image,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (ss *StorageService) DeleteListImage(ctx context.Context, id string) (*contracts.DeleteImageResponse, error) {
	requestUrl := fmt.Sprintf("%s/list/images/%s", ss.baseURL, id)

	var response contracts.DeleteImageResponse

	_, err := ss.client.DoRequest(
		ctx,
		http.MethodDelete,
		requestUrl,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}
