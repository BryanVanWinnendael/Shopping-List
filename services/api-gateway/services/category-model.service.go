package services

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"shopping-list/api-gateway/models"
	httphelper "shopping-list/shared/http"
)

type CategoryModelService struct {
	client  *httphelper.Client
	baseURL string
}

func NewCategoryModelService(client *httphelper.Client, baseURL string) *CategoryModelService {
	return &CategoryModelService{
		client:  client,
		baseURL: baseURL,
	}
}

func (cms *CategoryModelService) TrainModel(ctx context.Context) (*models.TrainModelResponse, error) {
	requestUrl := fmt.Sprintf("%s/model", cms.baseURL)

	var response models.TrainModelResponse

	_, err := cms.client.DoRequest(
		ctx,
		http.MethodPost,
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

func (cms *CategoryModelService) GetCategory(ctx context.Context, item string) (*models.CategoryResponse, error) {
	requestUrl := fmt.Sprintf("%s/category?item=%s",
		cms.baseURL,
		url.QueryEscape(item),
	)

	var response string

	_, err := cms.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl,
		nil,
		nil,
		&response,
	)
	if err != nil {
		return nil, err
	}

	return &models.CategoryResponse{
		Category: response,
	}, nil
}

func (cms *CategoryModelService) AddCategory(
	ctx context.Context,
	request models.AddCategoryRequest,
) (*models.AddCategoryResponse, error) {
	requestUrl := fmt.Sprintf("%s/category", cms.baseURL)

	var response models.AddCategoryResponse

	_, err := cms.client.DoRequest(
		ctx,
		http.MethodPost,
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
