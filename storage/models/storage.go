package models

type DeleteImageRequest struct {
	URL string `json:"url" validate:"required"`
}
