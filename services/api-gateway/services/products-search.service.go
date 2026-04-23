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
	var requestUrl strings.Builder
	_, err2 := fmt.Fprintf(&requestUrl, "%s/search?q=%s&page=%s&pageSize=%s", pss.baseURL, netUrl.QueryEscape(query), page, pageSize)
	if err2 != nil {
		return models.ProductsSearchResult{}, err2
	}

	for _, category := range categories {
		_, err := fmt.Fprintf(&requestUrl, "&category=%s", netUrl.QueryEscape(category))
		if err != nil {
			return models.ProductsSearchResult{}, err
		}
	}

	var response models.ProductsSearchResult

	_, err := pss.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl.String(),
		nil,
		nil,
		&response,
	)

	if err != nil {
		return models.ProductsSearchResult{}, err
	}

	return response, nil
}

func (pss *ProductsSearchService) FuzzySearchProducts(ctx context.Context, query string, category string, page string, pageSize string) (models.ProductsSearchResult, error) {
	requestUrl := fmt.Sprintf("%s/search/fuzzy?q=%s&category=%s&page=%s&pageSize=%s", pss.baseURL, url.QueryEscape(query), category, page, pageSize)

	var response models.ProductsSearchResult

	_, err := pss.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return models.ProductsSearchResult{}, err
	}

	return response, nil
}
