package services

import (
	"context"
	"fmt"
	"net/http"
	httphelper "shopping-list/api-gateway/http-helper"
	"shopping-list/api-gateway/models"
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

func (cs *CronService) CreateCronItem(ctx context.Context, request *models.CreateCronItemRequest) (*models.CronItem, error) {
	requestUrl := cs.baseURL

	var response models.CronItem

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

func (cs *CronService) GetAllCronItems(ctx context.Context) ([]models.CronItem, error) {
	requestUrl := fmt.Sprintf("%s/items", cs.baseURL)

	var response []models.CronItem

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

	return response, nil
}

func (cs *CronService) DeleteCronItem(ctx context.Context, itemID string) error {
	requestUrl := fmt.Sprintf("%s/%s", cs.baseURL, itemID)

	_, err := cs.client.DoRequest(
		ctx,
		http.MethodDelete,
		requestUrl,
		nil,
		nil,
		nil,
	)

	return err
}

func (cs *CronService) GetCronItemsByUser(ctx context.Context, user string) ([]models.CronItem, error) {
	requestUrl := fmt.Sprintf("%s/items/%s", cs.baseURL, user)

	var response []models.CronItem

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

	return response, nil
}

func (cs *CronService) UpdateCronItemCategory(ctx context.Context, itemID string, request models.UpdateCronItemRequest) error {
	requestUrl := fmt.Sprintf("%s/%s", cs.baseURL, itemID)

	_, err := cs.client.DoRequest(
		ctx,
		http.MethodPut,
		requestUrl,
		nil,
		request,
		nil,
	)

	return err
}
