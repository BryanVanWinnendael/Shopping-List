package http

import (
	"net/http"
	"time"
)

type Client struct {
	HttpClient   *http.Client
	defaultToken string
}

func NewClient(timeout time.Duration, token string) *Client {
	return &Client{
		HttpClient: &http.Client{
			Timeout: timeout,
		},
		defaultToken: token,
	}
}
