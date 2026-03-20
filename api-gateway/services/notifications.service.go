package services

import (
	"context"
	"fmt"
	"net/http"
	httphelper "shopping-list/api-gateway/http-helper"
	"shopping-list/api-gateway/models"
)

type NotificationsService struct {
	client  *httphelper.Client
	baseURL string
}

func NewNotificationsService(client *httphelper.Client, baseURL string) *NotificationsService {
	return &NotificationsService{
		client:  client,
		baseURL: baseURL,
	}
}

func (ns *NotificationsService) CreateNotification(ctx context.Context, request *models.NotificationCreateRequest) (*models.Notification, error) {
	url := ns.baseURL

	var response models.Notification

	_, err := ns.client.DoRequest(
		ctx,
		http.MethodPost,
		url,
		nil,
		request,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (ns *NotificationsService) GetAll(ctx context.Context) ([]models.Notification, error) {
	url := ns.baseURL

	var response []models.Notification

	_, err := ns.client.DoRequest(
		ctx,
		http.MethodGet,
		url,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return response, nil
}

func (ns *NotificationsService) GetUserNotifications(ctx context.Context, user string) ([]models.Notification, error) {
	url := fmt.Sprintf("%s/users/%s", ns.baseURL, user)

	var response []models.Notification

	_, err := ns.client.DoRequest(
		ctx,
		http.MethodGet,
		url,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return response, nil
}

func (ns *NotificationsService) DeleteUserNotification(ctx context.Context, user string, notificationType string) error {
	url := fmt.Sprintf("%s/%s/%s", ns.baseURL, user, notificationType)

	_, err := ns.client.DoRequest(
		ctx,
		http.MethodDelete,
		url,
		nil,
		nil,
		nil,
	)

	return err
}

func (ns *NotificationsService) SendPushNotificationByType(ctx context.Context, notifType string, user string, request models.PushNotificationRequest) error {
	url := fmt.Sprintf("%s/push/%s/%s", ns.baseURL, notifType, user)

	_, err := ns.client.DoRequest(
		ctx,
		http.MethodPost,
		url,
		nil,
		request,
		nil,
	)

	return err
}
