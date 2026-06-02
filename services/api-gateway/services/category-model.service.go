package services

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"shopping-list/shared/contracts"
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

func (cms *CategoryModelService) TrainModel(ctx context.Context) (*contracts.TrainModelResponse, error) {
	requestUrl := fmt.Sprintf("%s/model", cms.baseURL)

	var response contracts.TrainModelResponse

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

func (cms *CategoryModelService) GetCategory(ctx context.Context, product string) (*contracts.GetCategoryResponse, error) {
	requestUrl := fmt.Sprintf("%s/category?product=%s",
		cms.baseURL,
		url.QueryEscape(product),
	)

	var response contracts.GetCategoryResponse

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

	return &response, nil
}

func (cms *CategoryModelService) CreateCategory(
	ctx context.Context,
	request *contracts.CreateCategoryRequest,
) (*contracts.CreateCategoryResponse, error) {
	requestUrl := fmt.Sprintf("%s/category", cms.baseURL)

	var response contracts.CreateCategoryResponse

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
