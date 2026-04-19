package handlers

import (
	"errors"
	"net/http"
	"shopping-list/notifications/models"

	"github.com/labstack/echo/v4"
)

type NotificationsService interface {
	CreateNotification(recipe *models.NotificationCreate) (*models.Notification, error)
	GetNotification(id string) (*models.Notification, error)
	GetAllNotifications() ([]models.Notification, error)
	GetUserNotifications(userID string) ([]models.Notification, error)
	DeleteNotification(user string, notifType string) error
	SendPushNotification(notifType string, user string, env string) error
}

type NotificationsHandler struct {
	NotificationsService NotificationsService
}

func NewNotificationsHandler(ns NotificationsService) *NotificationsHandler {
	return &NotificationsHandler{NotificationsService: ns}
}

func (nh *NotificationsHandler) Add(c echo.Context) error {
	var request models.NotificationCreate
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	created, err := nh.NotificationsService.CreateNotification(&request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, created)
}

func (nh *NotificationsHandler) Get(c echo.Context) error {
	id := c.Param("id")

	notification, err := nh.NotificationsService.GetNotification(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, notification)
}

func (nh *NotificationsHandler) GetAll(c echo.Context) error {
	list, err := nh.NotificationsService.GetAllNotifications()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, list)
}

func (nh *NotificationsHandler) GetUserNotifications(c echo.Context) error {
	userID := c.Param("user")

	list, err := nh.NotificationsService.GetUserNotifications(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, list)
}

func (nh *NotificationsHandler) Delete(c echo.Context) error {
	notifType := c.Param("type")
	user := c.Param("user")
	if notifType == "" || user == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "type and user are required"})
	}

	if err := nh.NotificationsService.DeleteNotification(user, notifType); err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}

func (nh *NotificationsHandler) SendPushByType(c echo.Context) error {
	notifType := c.Param("type")
	user := c.Param("user")

	if notifType == "" || user == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "type and user are required"})
	}

	env := ""
	body := make(map[string]interface{})
	if err := c.Bind(&body); err != nil && !errors.Is(err, echo.ErrUnsupportedMediaType) {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	if v, ok := body["env"]; ok {
		if s, ok := v.(string); ok {
			env = s
		}
	}

	if err := nh.NotificationsService.SendPushNotification(notifType, user, env); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status": "push_sent",
		"type":   notifType,
		"user":   user,
	})
}
