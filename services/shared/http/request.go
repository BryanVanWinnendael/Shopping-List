package http

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func (c *Client) DoRequest(
	ctx context.Context,
	method string,
	url string,
	headers map[string]string,
	requestBody interface{},
	responseBody interface{},
) (int, error) {
	var body io.Reader

	if requestBody != nil {
		jsonBytes, err := json.Marshal(requestBody)
		if err != nil {
			return 0, fmt.Errorf("failed to marshal request body: %w", err)
		}
		body = bytes.NewBuffer(jsonBytes)
	}

	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return 0, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	if c.defaultToken != "" {
		req.Header.Set("Authorization", "Bearer "+c.defaultToken)
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	resp, err := c.HttpClient.Do(req)
	if err != nil {
		return 0, fmt.Errorf("request failed: %w", err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			fmt.Printf("failed to close response body: %v\n", err)
		}
	}(resp.Body)

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return resp.StatusCode, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		return resp.StatusCode, fmt.Errorf("error response: %s", string(respBytes))
	}

	if responseBody != nil {
		if err := json.Unmarshal(respBytes, responseBody); err != nil {
			return resp.StatusCode, fmt.Errorf("failed to unmarshal response: %w", err)
		}
	}

	return resp.StatusCode, nil
}

func (c *Client) DoGetBackup(ctx context.Context, url string) (*http.Response, error) {
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		url,
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	if c.defaultToken != "" {
		req.Header.Set("Authorization", "Bearer "+c.defaultToken)
	}

	resp, err := c.HttpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}

	if resp.StatusCode >= 400 {
		defer func(Body io.ReadCloser) {
			err := Body.Close()
			if err != nil {
				fmt.Printf("failed to close response body: %v\n", err)
			}
		}(resp.Body)

		b, _ := io.ReadAll(resp.Body)

		return nil, fmt.Errorf(
			"backup request failed (status %d): %s",
			resp.StatusCode,
			string(b),
		)
	}

	return resp, nil
}
