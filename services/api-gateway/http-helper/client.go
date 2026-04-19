package httphelper

import (
	"net/http"
	"shopping-list/api-gateway/internal/config"
	"time"
)

type Client struct {
	httpClient   *http.Client
	defaultToken string
}

func NewClient(timeout time.Duration) *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: timeout,
		},
		defaultToken: config.Vars.APIAuthToken,
	}
}
