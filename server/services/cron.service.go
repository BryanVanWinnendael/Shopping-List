package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"shopping-list/server/internal/config"
	"shopping-list/server/models"
	"time"
)

type CronService struct {
	client  *http.Client
	baseURL string
}

func NewCronService() *CronService {
	return &CronService{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		baseURL: config.Vars.CronAPIUrl,
	}
}

func (c *CronService) AddCronItem(item models.CronItem) ([]byte, int, error) {
	return c.doRequest(
		http.MethodPost,
		"/api/cron",
		item,
	)
}

func (c *CronService) GetAllCronItems() ([]byte, int, error) {
	return c.doRequest(
		http.MethodGet,
		"/api/cron/items",
		nil,
	)
}

func (c *CronService) UpdateCategory(id string, category string) ([]byte, int, error) {

	body := map[string]string{
		"category": category,
	}

	return c.doRequest(
		http.MethodPut,
		fmt.Sprintf("/api/cron/%s", id),
		body,
	)
}

func (c *CronService) Delete(id string) ([]byte, int, error) {
	return c.doRequest(
		http.MethodDelete,
		fmt.Sprintf("/api/cron/%s", id),
		nil,
	)
}

func (c *CronService) GetCronItemsByAddedBy(user string) ([]byte, int, error) {
	return c.doRequest(
		http.MethodGet,
		fmt.Sprintf("/api/cron/items/%s", user),
		nil,
	)
}

func (c *CronService) doRequest(
	method string,
	path string,
	body any,
) ([]byte, int, error) {

	var reqBody io.Reader

	if body != nil {
		b, _ := json.Marshal(body)
		reqBody = bytes.NewBuffer(b)
	}

	req, err := http.NewRequest(
		method,
		fmt.Sprintf("%s%s", c.baseURL, path),
		reqBody,
	)
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", config.Vars.APIAuthToken)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	return data, resp.StatusCode, err
}
