package services

import (
	"context"
	"fmt"
	"net/http"
	"shopping-list/api-gateway/models"
	httphelper "shopping-list/shared/http"
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

func (ns *NotificationsService) Subscribe(ctx context.Context, request *models.NotificationCreateRequest) (*models.Notification, error) {
	requestUrl := ns.baseURL

	var response models.Notification

	_, err := ns.client.DoRequest(
		ctx,
		http.MethodPost,
		requestUrl,
		nil,
		request,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (ns *NotificationsService) GetAllNotifications(ctx context.Context) ([]models.Notification, error) {
	requestUrl := ns.baseURL

	var response []models.Notification

	_, err := ns.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl,
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
	requestUrl := fmt.Sprintf("%s/users/%s", ns.baseURL, user)

	var response []models.Notification

	_, err := ns.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl,
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
	requestUrl := fmt.Sprintf("%s/%s/%s", ns.baseURL, user, notificationType)

	_, err := ns.client.DoRequest(
		ctx,
		http.MethodDelete,
		requestUrl,
		nil,
		nil,
		nil,
	)

	return err
}

func (ns *NotificationsService) PushUserNotificationByType(ctx context.Context, notifType string, user string, request models.PushNotificationRequest) error {
	requestUrl := fmt.Sprintf("%s/push/%s/%s", ns.baseURL, notifType, user)

	_, err := ns.client.DoRequest(
		ctx,
		http.MethodPost,
		requestUrl,
		nil,
		request,
		nil,
	)

	return err
}
