package contracts

import "shopping-list/shared/models"

type CreateNotificationRequest struct {
	User  string                  `json:"user" validate:"required"`
	Type  models.NotificationType `json:"type" validate:"required"`
	Token string                  `json:"token" validate:"required"`
}

type CreateNotificationResponse models.Notification

type GetAllNotificationsResponse []models.Notification

type GetUserNotificationsResponse []models.Notification

type PushUserNotificationByTypeRequest struct {
	Env  string `json:"env,omitempty"`
	Text string `json:"text,omitempty"`
}
type PushUserNotificationByTypeResponse struct {
	Message string                  `json:"message"`
	Type    models.NotificationType `json:"type,omitempty"`
	User    string                  `json:"user,omitempty"`
}

type DeleteUserNotificationResponse struct {
	Message string                  `json:"message"`
	Type    models.NotificationType `json:"type,omitempty"`
	User    string                  `json:"user,omitempty"`
}
