package handlers

import (
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"

	"github.com/labstack/echo/v4"
)

type NotificationsService interface {
	Subscribe(request *contracts.CreateNotificationRequest) (*contracts.CreateNotificationResponse, error)
	GetAllNotifications() (*contracts.GetAllNotificationsResponse, error)
	GetUserNotifications(user string) (*contracts.GetUserNotificationsResponse, error)
	Unsubscribe(user string, notifType models.NotificationType) (*contracts.DeleteUserNotificationResponse, error)
	PushUserNotificationByType(notifType models.NotificationType, user string, request *contracts.PushUserNotificationByTypeRequest) (*contracts.PushUserNotificationByTypeResponse, error)
}

type NotificationsHandler struct {
	NotificationsService NotificationsService
}

func NewNotificationsHandler(ns NotificationsService) *NotificationsHandler {
	return &NotificationsHandler{NotificationsService: ns}
}

func (nh *NotificationsHandler) Subscribe(c echo.Context) error {
	var request contracts.CreateNotificationRequest
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	result, err := nh.NotificationsService.Subscribe(&request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

func (nh *NotificationsHandler) GetAllNotifications(c echo.Context) error {
	result, err := nh.NotificationsService.GetAllNotifications()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

func (nh *NotificationsHandler) GetUserNotifications(c echo.Context) error {
	user := c.Param("user")

	result, err := nh.NotificationsService.GetUserNotifications(user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

func (nh *NotificationsHandler) Unsubscribe(c echo.Context) error {
	notifType := c.Param("type")
	user := c.Param("user")
	if notifType == "" || user == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "type and user are required"})
	}

	nt := models.NotificationType(notifType)
	result, err := nh.NotificationsService.Unsubscribe(user, nt)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

func (nh *NotificationsHandler) PushUserNotificationByType(c echo.Context) error {
	notifType := c.Param("type")
	user := c.Param("user")

	if notifType == "" || user == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "type and user are required"})
	}

	var request contracts.PushUserNotificationByTypeRequest
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid JSON body",
		})
	}

	nt := models.NotificationType(notifType)
	result, err := nh.NotificationsService.PushUserNotificationByType(nt, user, &request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}
