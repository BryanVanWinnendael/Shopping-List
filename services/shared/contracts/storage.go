package contracts

import (
	"shopping-list/shared/models"
)

type UploadImageResponse models.Image

type DeleteImageRequest struct {
	URL string `json:"url" validate:"required"`
}

type DeleteImageResponse struct {
	Message string `json:"message"`
	Large   string `json:"large,omitempty"`
}

type DeleteStorageResponse struct {
	Message string `json:"message"`
	Id      string `json:"id,omitempty"`
}
