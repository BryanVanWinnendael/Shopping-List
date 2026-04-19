package models

import "mime/multipart"

type UploadImageResponse struct {
	Large string `json:"large"`
	Small string `json:"small"`
}

type UploadImageRequest struct {
	Image *multipart.FileHeader `json:"image" validate:"required"`
}

type DeleteImageRequest struct {
	URL string `json:"url" validate:"required"`
}
