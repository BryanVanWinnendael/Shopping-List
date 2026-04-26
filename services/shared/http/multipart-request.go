package http

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
)

func (c *Client) DoMultipartRequest(
	ctx context.Context,
	method string,
	url string,
	fileFieldName string,
	fileHeader *multipart.FileHeader,
	extraFields map[string]string,
	responseBody interface{},
) (int, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return 0, fmt.Errorf("failed to open file header: %w", err)
	}
	defer func(file multipart.File) {
		err := file.Close()
		if err != nil {
			fmt.Printf("failed to close response body: %v\n", err)
		}
	}(file)

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile(fileFieldName, fileHeader.Filename)
	if err != nil {
		return 0, fmt.Errorf("failed to create form file: %w", err)
	}

	_, err = io.Copy(part, file)
	if err != nil {
		return 0, fmt.Errorf("failed to copy file: %w", err)
	}

	for key, value := range extraFields {
		if err := writer.WriteField(key, value); err != nil {
			return 0, fmt.Errorf("failed to write field %s: %w", key, err)
		}
	}

	if err := writer.Close(); err != nil {
		return 0, fmt.Errorf("failed to close writer: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, method, url, &body)
	if err != nil {
		return 0, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	if c.defaultToken != "" {
		req.Header.Set("Authorization", "Bearer "+c.defaultToken)
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
		return resp.StatusCode, fmt.Errorf("%s", string(respBytes))
	}

	if responseBody != nil {
		if err := json.Unmarshal(respBytes, responseBody); err != nil {
			return resp.StatusCode, fmt.Errorf("failed to unmarshal response: %w", err)
		}
	}

	return resp.StatusCode, nil
}
