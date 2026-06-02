package services

import (
	"context"
	"fmt"
	"net/http"
	"shopping-list/shared/contracts"
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

func (ls *LogsService) GetAppLogs(ctx context.Context) (*contracts.GetAppLogsResponse, error) {
	requestUrl := fmt.Sprintf("%s/%s", ls.baseURL, "app")

	var response contracts.GetAppLogsResponse

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

func (ls *LogsService) CreateAppLog(ctx context.Context, request *contracts.CreateAppLogRequest) (*contracts.CreateAppLogResponse, error) {
	requestUrl := fmt.Sprintf("%s/%s", ls.baseURL, "app")

	var response contracts.CreateAppLogResponse

	_, err := ls.client.DoRequest(
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

func (ls *LogsService) DeleteAppLogs(ctx context.Context) (*contracts.DeleteAppLogResponse, error) {
	requestUrl := fmt.Sprintf("%s/%s", ls.baseURL, "app")

	var response contracts.DeleteAppLogResponse

	_, err := ls.client.DoRequest(
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
