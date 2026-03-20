package models

// -------------------
// Notification model for BoltDB
// -------------------
type Notification struct {
	ID    string `json:"id"`    // UUID string
	User  string `json:"user"`  // user identifier
	Type  string `json:"type"`  // notification type
	Token string `json:"token"` // device push token
}

// -------------------
// NotificationCreate for POST requests
// -------------------
type NotificationCreate struct {
	User  string `json:"user" validate:"required"`
	Type  string `json:"type" validate:"required"`
	Token string `json:"token" validate:"required"`
}
