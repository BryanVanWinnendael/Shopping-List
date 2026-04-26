package services

import (
	"context"
	"fmt"
	"net/http"
	httphelper "shopping-list/shared/http"
)

type NotificationServiceImpl struct {
	client  *httphelper.Client
	baseURL string
}

func NewNotificationService(client *httphelper.Client, baseURL string) *NotificationServiceImpl {
	return &NotificationServiceImpl{
		client:  client,
		baseURL: baseURL,
	}
}

func (nsi *NotificationServiceImpl) SendNotification(user string, notificationType string) error {
	requestUrl := fmt.Sprintf("%s/push/%s/%s", nsi.baseURL, notificationType, user)

	status, err := nsi.client.DoRequest(
		context.Background(),
		http.MethodPost,
		requestUrl,
		nil,
		nil,
		nil,
	)

	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}

	if status >= 400 {
		return fmt.Errorf("received error status: %d", status)
	}

	return nil
}
