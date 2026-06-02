package handlers

import (
	"context"
	"net/http"
	"shopping-list/api-gateway/response"
	"shopping-list/shared/contracts"

	"github.com/labstack/echo/v4"
)

type NotificationsService interface {
	Subscribe(ctx context.Context, request *contracts.CreateNotificationRequest) (*contracts.CreateNotificationResponse, error)
	GetAllNotifications(ctx context.Context) (*contracts.GetAllNotificationsResponse, error)
	GetUserNotifications(ctx context.Context, user string) (*contracts.GetUserNotificationsResponse, error)
	DeleteUserNotification(ctx context.Context, user string, notificationType string) (*contracts.DeleteUserNotificationResponse, error)
	PushUserNotificationByType(ctx context.Context, notifType string, user string, request *contracts.PushUserNotificationByTypeRequest) (*contracts.PushUserNotificationByTypeResponse, error)
}

func NewNotificationsHandler(ls NotificationsService) *NotificationsHandler {
	return &NotificationsHandler{NotificationsService: ls}
}

type NotificationsHandler struct {
	NotificationsService NotificationsService
}

func (nh *NotificationsHandler) Subscribe(c echo.Context) error {
	var request contracts.CreateNotificationRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	missingFields := response.GetMissingRequestFields(request)
	if len(missingFields) > 0 {
		return response.Missing(c, response.SourceBody, missingFields...)
	}

	result, err := nh.NotificationsService.Subscribe(c.Request().Context(), &request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (nh *NotificationsHandler) GetAllNotifications(c echo.Context) error {
	result, err := nh.NotificationsService.GetAllNotifications(c.Request().Context())
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

	result, err := nh.NotificationsService.DeleteUserNotification(c.Request().Context(), user, notificationType)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}

func (nh *NotificationsHandler) PushUserNotificationByType(c echo.Context) error {
	notifType := c.Param("type")
	user := c.Param("user")

	missingPathParams := response.GetMissingPathParams(c, "type", "user")
	if len(missingPathParams) > 0 {
		return response.Missing(c, response.SourceParam, missingPathParams...)
	}

	var request contracts.PushUserNotificationByTypeRequest
	if err := c.Bind(&request); err != nil {
		return response.Error(c, http.StatusBadRequest, response.InvalidBodyResponse)
	}

	result, err := nh.NotificationsService.PushUserNotificationByType(c.Request().Context(), notifType, user, &request)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, err.Error())
	}

	return response.Success(c, http.StatusOK, result)
}
