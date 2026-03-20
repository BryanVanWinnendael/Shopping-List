package services

import (
	"context"
	"net/http"
	httphelper "shopping-list/api-gateway/http-helper"
	"shopping-list/api-gateway/models"
)

type LogsService struct {
	client  *httphelper.Client
	baseURL string
}

func NewLogsService(client *httphelper.Client, baseURL string) *LogsService {
	return &LogsService{
		client:  client,
		baseURL: baseURL,
	}
}

func (ls *LogsService) GetAppLogs(ctx context.Context) (*models.GetAppLogsResponse, error) {
	url := ls.baseURL

	var response models.GetAppLogsResponse

	_, err := ls.client.DoRequest(
		ctx,
		http.MethodGet,
		url,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (ls *LogsService) CreateAppLog(ctx context.Context, request models.CreateLogRequest) error {
	url := ls.baseURL

	var response models.CreateLogResponse

	_, err := ls.client.DoRequest(
		ctx,
		http.MethodPost,
		url,
		nil,
		request,
		&response,
	)

	return err
}

func (ls *LogsService) DeleteAppLog(ctx context.Context) error {
	url := ls.baseURL

	var response models.DeleteLogResponse

	_, err := ls.client.DoRequest(
		ctx,
		http.MethodDelete,
		url,
		nil,
		nil,
		&response,
	)

	return err
}
