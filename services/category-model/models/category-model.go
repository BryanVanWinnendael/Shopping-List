package models

type CreateCategoryRequest struct {
	Item     string `json:"item" validate:"required"`
	Category string `json:"category" validate:"required"`
}
