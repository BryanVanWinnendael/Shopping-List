package models

type Notification struct {
	ID    string `json:"id"`
	User  string `json:"user"`
	Type  string `json:"type"`
	Token string `json:"token"`
}

type NotificationCreateRequest struct {
	User  string `json:"user" validate:"required"`
	Type  string `json:"type" validate:"required"`
	Token string `json:"token" validate:"required"`
}

type PushNotificationRequest struct {
	Env string `json:"env"`
}
