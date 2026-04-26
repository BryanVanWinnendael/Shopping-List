package services

import (
	"context"
	"fmt"
	"net/http"
	"shopping-list/notifications/models"
	httphelper "shopping-list/shared/http"
)

type ExpoPushServiceImpl struct {
	client *httphelper.Client
}

func NewExpoPushService(client *httphelper.Client) *ExpoPushServiceImpl {
	return &ExpoPushServiceImpl{client: client}
}

func (e *ExpoPushServiceImpl) PushNotificationToUser(token, title, body string) error {
	payload := models.ExpoPushRequest{
		To:    token,
		Title: title,
		Body:  body,
	}

	status, err := e.client.DoRequest(
		context.Background(),
		http.MethodPost,
		"https://exp.host/--/api/v2/push/send",
		nil,
		payload,
		nil,
	)

	if err != nil {
		return fmt.Errorf("expo notification failed: %w", err)
	}

	if status >= 400 {
		return fmt.Errorf("expo notification failed with status %d", status)
	}

	return nil
}
