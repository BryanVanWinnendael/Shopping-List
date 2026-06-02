package contracts

import "shopping-list/shared/models"

type GetAppLogsResponse []models.Log

type CreateAppLogRequest struct {
	User   string  `json:"user" validate:"required"`
	Action string  `json:"action" validate:"required"`
	Text   string  `json:"text" validate:"required"`
	Error  *bool   `json:"error,omitempty"`
	Date   *string `json:"date,omitempty"`
}

type CreateAppLogResponse models.Log

type DeleteAppLogResponse struct {
	Message string `json:"message"`
}
