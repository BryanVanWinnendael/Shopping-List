package services

import (
	"context"
	"fmt"
	"net/http"
	"shopping-list/api-gateway/models"
	httphelper "shopping-list/shared/http"
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
	requestUrl := fmt.Sprintf("%s/%s", ls.baseURL, "app")

	var response models.GetAppLogsResponse

	_, err := ls.client.DoRequest(
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

func (ls *LogsService) CreateAppLog(ctx context.Context, request models.CreateLogRequest) error {
	requestUrl := fmt.Sprintf("%s/%s", ls.baseURL, "app")

	var response models.CreateLogResponse

	_, err := ls.client.DoRequest(
		ctx,
		http.MethodPost,
		requestUrl,
		nil,
		request,
		&response,
	)

	return err
}

func (ls *LogsService) DeleteAppLogs(ctx context.Context) error {
	requestUrl := fmt.Sprintf("%s/%s", ls.baseURL, "app")

	var response models.DeleteLogResponse

	_, err := ls.client.DoRequest(
		ctx,
		http.MethodDelete,
		requestUrl,
		nil,
		nil,
		&response,
	)

	return err
}
