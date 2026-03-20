package handlers

import (
	"context"
	"net/http"
	"shopping-list/api-gateway/models"
	"shopping-list/api-gateway/response"

	"github.com/labstack/echo/v4"
)

type NotificationsService interface {
	CreateNotification(ctx context.Context, request *models.NotificationCreateRequest) (*models.Notification, error)
	GetAll(ctx context.Context) ([]models.Notification, error)
	GetUserNotifications(ctx context.Context, user string) ([]models.Notification, error)
	DeleteUserNotification(ctx context.Context, user string, notificationType string) error
	SendPushNotificationByType(ctx context.Context, notifType string, user string, request models.PushNotificationRequest) error
}

func NewNotificationsHandler(ls NotificationsService) *NotificationsHandler {
	return &NotificationsHandler{NotificationsService: ls}
}

type NotificationsHandler struct {
	NotificationsService NotificationsService
}

func (nh *NotificationsHandler) CreateNotification(c echo.Context) error {
	var request models.NotificationCreateRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingFields := response.GetMissingRequestFields(request)
	if len(missingFields) > 0 {
		return response.Missing(c, response.SourceBody, missingFields...)
	}

	result, err := nh.NotificationsService.CreateNotification(c.Request().Context(), &request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (nh *NotificationsHandler) GetAll(c echo.Context) error {
	result, err := nh.NotificationsService.GetAll(c.Request().Context())
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (nh *NotificationsHandler) GetUserNotifications(c echo.Context) error {
	user := c.Param("user")

	missingPathParams := response.GetMissingPathParams(c, "user")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	result, err := nh.NotificationsService.GetUserNotifications(c.Request().Context(), user)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (nh *NotificationsHandler) DeleteUserNotification(c echo.Context) error {
	user := c.Param("user")
	notificationType := c.Param("notificationType")

	missingPathParams := response.GetMissingPathParams(c, "user", "notificationType")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	err := nh.NotificationsService.DeleteUserNotification(c.Request().Context(), user, notificationType)

	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, "Notification deleted successfully")
}

func (nh *NotificationsHandler) SendPushNotificationByType(c echo.Context) error {
	notifType := c.Param("type")
	user := c.Param("user")

	missingPathParams := response.GetMissingPathParams(c, "type", "user")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	var request models.PushNotificationRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	if err := nh.NotificationsService.SendPushNotificationByType(c.Request().Context(), notifType, user, request); err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, "Push notification sent successfully")
}
