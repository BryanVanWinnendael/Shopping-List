package models

type AddCategoryRequest struct {
	Item     string `json:"item" validate:"required"`
	Category string `json:"category" validate:"required"`
}
