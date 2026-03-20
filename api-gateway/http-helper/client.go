package httphelper

import (
	"net/http"
	"os"
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
		defaultToken: os.Getenv("API_TOKEN"),
	}
}
