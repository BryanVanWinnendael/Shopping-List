package services

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	netUrl "net/url"
	"shopping-list/shared/contracts"
	httphelper "shopping-list/shared/http"
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

func (pss *ProductsSearchService) SearchProducts(ctx context.Context, query string, categories []string, page string) (*contracts.ProductsSearchResponse, error) {
	var requestUrl strings.Builder
	_, err2 := fmt.Fprintf(&requestUrl, "%s/search?query=%s&page=%s", pss.baseURL, netUrl.QueryEscape(query), page)
	if err2 != nil {
		return nil, err2
	}

	for _, category := range categories {
		_, err := fmt.Fprintf(&requestUrl, "&category=%s", netUrl.QueryEscape(category))
		if err != nil {
			return nil, err
		}
	}

	var response contracts.ProductsSearchResponse

	_, err := pss.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl.String(),
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (pss *ProductsSearchService) FuzzySearchProducts(ctx context.Context, query string, category string, page string) (*contracts.ProductsSearchResponse, error) {
	requestUrl := fmt.Sprintf("%s/search/fuzzy?query=%s&category=%s&page=%s", pss.baseURL, url.QueryEscape(query), category, page)

	var response contracts.ProductsSearchResponse

	_, err := pss.client.DoRequest(
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

func (pss *ProductsSearchService) GetBackup(ctx context.Context) (*http.Response, error) {
	requestUrl := fmt.Sprintf("%s/backup", pss.baseURL)

	response, err := pss.client.DoGetBackup(ctx, requestUrl)

	if err != nil {
		return nil, err
	}

	return response, nil
}
