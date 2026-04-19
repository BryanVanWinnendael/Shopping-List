package services

import (
	"fmt"
	"net/http"
	"shopping-list/cron/internal/config"
)

type NotificationServiceImpl struct {
	client *http.Client
}

func NewNotificationService(client *http.Client) *NotificationServiceImpl {
	if client == nil {
		client = &http.Client{}
	}
	return &NotificationServiceImpl{client: client}
}

func (nsi *NotificationServiceImpl) SendNotification(user string, notificationType string) error {
	notificationAPI := config.Vars.NotificationsAPIUrl
	url := fmt.Sprintf("%s/push/%s/%s", notificationAPI, notificationType, user)

	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := nsi.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			fmt.Printf("failed to close response body: %v\n", err)
		}
	}()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("received error status: %s", resp.Status)
	}

	return nil
}
