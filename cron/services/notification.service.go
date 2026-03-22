package services

import (
	"fmt"
	"net/http"
	"shopping-list/cron/internal/config"
)

type NotificationServiceImpl struct{}

func NewNotificationService() *NotificationServiceImpl {
	return &NotificationServiceImpl{}
}

func (e *NotificationServiceImpl) SendNotification(user string, notificationType string) error {
	notificationAPI := config.Vars.NotificationsAPIUrl
	url := fmt.Sprintf("%s/push/%s/%s", notificationAPI, notificationType, user)

	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("received error status: %s", resp.Status)
	}

	return nil
}
