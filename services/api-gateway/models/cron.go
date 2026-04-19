package models

type CronItem struct {
	ID       string `json:"id"`
	Category string `json:"category"`
	AddedBy  string `json:"addedBy"`
	Item     string `json:"item"`
}

type CreateCronItemRequest struct {
	Category string `json:"category" validate:"required"`
	AddedBy  string `json:"addedBy" validate:"required"`
	Item     string `json:"item" validate:"required"`
}

type UpdateCronItemRequest struct {
	Category string `json:"category" validate:"required"`
}
