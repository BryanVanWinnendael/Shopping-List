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

func (ls *LogsService) GetLogs(ctx context.Context, page string) (*contracts.GetLogsResponse, error) {
	requestUrl := fmt.Sprintf("%s?page=%s", ls.baseURL, page)

	var response contracts.GetLogsResponse

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

func (ls *LogsService) CreateLog(ctx context.Context, request *contracts.CreateLogRequest) (*contracts.CreateLogResponse, error) {
	requestUrl := ls.baseURL

	var response contracts.CreateLogResponse

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

func (ls *LogsService) DeleteLogs(ctx context.Context) (*contracts.DeleteLogResponse, error) {
	requestUrl := ls.baseURL

	var response contracts.DeleteLogResponse

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

func (ls *LogsService) GetBackup(ctx context.Context) (*http.Response, error) {
	requestUrl := fmt.Sprintf("%s/backup", ls.baseURL)

	response, err := ls.client.DoGetBackup(ctx, requestUrl)

	if err != nil {
		return nil, err
	}

	return response, nil
}

func (ls *LogsService) SearchLogs(ctx context.Context, query string, page string) (*contracts.SearchLogsResponse, error) {
	requestUrl := fmt.Sprintf("%s/search?query=%s&page=%s", ls.baseURL, query, page)

	var response contracts.SearchLogsResponse

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
