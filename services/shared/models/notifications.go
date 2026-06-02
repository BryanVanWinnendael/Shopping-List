package models

type NotificationType string

const (
	NotificationTimed   NotificationType = "timed"
	NotificationRemoved NotificationType = "removed"
	NotificationAdded   NotificationType = "added"
)

type Notification struct {
	Id    string           `json:"id"`
	User  string           `json:"user"`
	Type  NotificationType `json:"type"`
	Token string           `json:"token"`
}
