package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type ExpoPushServiceImpl struct {
	client *http.Client
}

func NewExpoPushService(client *http.Client) *ExpoPushServiceImpl {
	if client == nil {
		client = &http.Client{}
	}
	return &ExpoPushServiceImpl{client: client}
}

func (e *ExpoPushServiceImpl) PushNotificationToUser(token, title, body string) error {
	payload := map[string]interface{}{
		"to":    token,
		"title": title,
		"body":  body,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequest(
		http.MethodPost,
		"https://exp.host/--/api/v2/push/send",
		bytes.NewBuffer(data),
	)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := e.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to push request: %w", err)
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			fmt.Printf("failed to close response body: %v\n", err)
		}
	}()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("expo notification failed: %s", resp.Status)
	}

	return nil
}
