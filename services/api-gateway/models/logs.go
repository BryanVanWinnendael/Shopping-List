package models

type GetAppLogsResponse struct {
	Logs []string `json:"logs"`
}

type CreateLogRequest struct {
	Text string `json:"text" validate:"required"`
}

type CreateLogResponse struct {
	Message string `json:"message"`
}

type DeleteLogResponse struct {
	Message string `json:"message"`
}
