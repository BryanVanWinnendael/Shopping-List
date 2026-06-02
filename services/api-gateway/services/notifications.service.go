package services

import (
	"context"
	"fmt"
	"net/http"
	"shopping-list/shared/contracts"
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

func (ns *NotificationsService) Subscribe(ctx context.Context, request *contracts.CreateNotificationRequest) (*contracts.CreateNotificationResponse, error) {
	requestUrl := ns.baseURL

	var response contracts.CreateNotificationResponse

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

func (ns *NotificationsService) GetAllNotifications(ctx context.Context) (*contracts.GetAllNotificationsResponse, error) {
	requestUrl := ns.baseURL

	var response contracts.GetAllNotificationsResponse

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

	return &response, nil
}

func (ns *NotificationsService) GetUserNotifications(ctx context.Context, user string) (*contracts.GetUserNotificationsResponse, error) {
	requestUrl := fmt.Sprintf("%s/users/%s", ns.baseURL, user)

	var response contracts.GetUserNotificationsResponse

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

	return &response, nil
}

func (ns *NotificationsService) DeleteUserNotification(ctx context.Context, user string, notificationType string) (*contracts.DeleteUserNotificationResponse, error) {
	requestUrl := fmt.Sprintf("%s/%s/%s", ns.baseURL, user, notificationType)

	var response contracts.DeleteUserNotificationResponse

	_, err := ns.client.DoRequest(
		ctx,
		http.MethodDelete,
		requestUrl,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (ns *NotificationsService) PushUserNotificationByType(ctx context.Context, notifType string, user string, request *contracts.PushUserNotificationByTypeRequest) (*contracts.PushUserNotificationByTypeResponse, error) {
	requestUrl := fmt.Sprintf("%s/push/%s/%s", ns.baseURL, notifType, user)

	var response contracts.PushUserNotificationByTypeResponse

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
