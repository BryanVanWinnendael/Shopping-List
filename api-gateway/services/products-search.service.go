package services

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	netUrl "net/url"
	httphelper "shopping-list/api-gateway/http-helper"
	"shopping-list/api-gateway/models"
)

type ProductsSearchService struct {
	client  *httphelper.Client
	baseURL string
}

func NewProductsSearchService(client *httphelper.Client, baseURL string) *ProductsSearchService {
	return &ProductsSearchService{
		client:  client,
		baseURL: baseURL,
	}
}

func (pss *ProductsSearchService) SearchProducts(ctx context.Context, query string, categories []string) (models.ProductsSearchResult, error) {
	url := fmt.Sprintf("%s/search?q=%s", pss.baseURL, netUrl.QueryEscape(query))

	for _, category := range categories {
		url += fmt.Sprintf("&category=%s", netUrl.QueryEscape(category))
	}

	var response models.ProductsSearchResult

	_, err := pss.client.DoRequest(
		ctx,
		http.MethodGet,
		url,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return models.ProductsSearchResult{}, err
	}

	return response, nil
}

func (pss *ProductsSearchService) SearchProduct(ctx context.Context, query string, category string) (models.ProductsSearchResult, error) {
	url := fmt.Sprintf("%s/search/fuzzy?q=%s&category=%s", pss.baseURL, url.QueryEscape(query), category)

	var response models.ProductsSearchResult

	_, err := pss.client.DoRequest(
		ctx,
		http.MethodGet,
		url,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return models.ProductsSearchResult{}, err
	}

	return response, nil
}
