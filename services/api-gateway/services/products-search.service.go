package services

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	netUrl "net/url"
	httphelper "shopping-list/api-gateway/http-helper"
	"shopping-list/api-gateway/models"
	"strings"
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

func (pss *ProductsSearchService) SearchProducts(ctx context.Context, query string, categories []string, page string, pageSize string) (models.ProductsSearchResult, error) {
	var url strings.Builder
	fmt.Fprintf(&url, "%s/search?q=%s&page=%s&pageSize=%s", pss.baseURL, netUrl.QueryEscape(query), page, pageSize)

	for _, category := range categories {
		fmt.Fprintf(&url, "&category=%s", netUrl.QueryEscape(category))
	}

	var response models.ProductsSearchResult

	_, err := pss.client.DoRequest(
		ctx,
		http.MethodGet,
		url.String(),
		nil,
		nil,
		&response,
	)

	if err != nil {
		return models.ProductsSearchResult{}, err
	}

	return response, nil
}

func (pss *ProductsSearchService) SearchProduct(ctx context.Context, query string, category string, page string, pageSize string) (models.ProductsSearchResult, error) {
	url := fmt.Sprintf("%s/search/fuzzy?q=%s&category=%s&page=%s&pageSize=%s", pss.baseURL, url.QueryEscape(query), category, page, pageSize)

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
