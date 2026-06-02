package services

import (
	"context"
	"fmt"
	"net/http"
	"shopping-list/shared/contracts"
	httphelper "shopping-list/shared/http"
)

type CronService struct {
	client  *httphelper.Client
	baseURL string
}

func NewCronService(client *httphelper.Client, baseURL string) *CronService {
	return &CronService{
		client:  client,
		baseURL: baseURL,
	}
}

func (cs *CronService) CreateCronProduct(ctx context.Context, request *contracts.CreateCronProductRequest) (*contracts.CreateCronProductResponse, error) {
	requestUrl := cs.baseURL

	var response contracts.CreateCronProductResponse

	_, err := cs.client.DoRequest(
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

func (cs *CronService) GetAllCronProducts(ctx context.Context) (*contracts.GetAllCronProductsResponse, error) {
	requestUrl := fmt.Sprintf("%s/products", cs.baseURL)

	var response contracts.GetAllCronProductsResponse

	_, err := cs.client.DoRequest(
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

func (cs *CronService) DeleteCronProduct(ctx context.Context, id string) (*contracts.DeleteCronProductResponse, error) {
	requestUrl := fmt.Sprintf("%s/%s", cs.baseURL, id)

	var response contracts.DeleteCronProductResponse

	_, err := cs.client.DoRequest(
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

func (cs *CronService) GetCronProductsByUser(ctx context.Context, user string) (*contracts.GetCronProductsByUserResponse, error) {
	requestUrl := fmt.Sprintf("%s/products/%s", cs.baseURL, user)

	var response contracts.GetCronProductsByUserResponse

	_, err := cs.client.DoRequest(
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

func (cs *CronService) UpdateCronProductCategory(ctx context.Context, id string, request *contracts.UpdateCronProductCategoryRequest) (*contracts.UpdateCronProductCategoryResponse, error) {
	requestUrl := fmt.Sprintf("%s/%s", cs.baseURL, id)

	var response contracts.UpdateCronProductCategoryResponse

	_, err := cs.client.DoRequest(
		ctx,
		http.MethodPut,
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
