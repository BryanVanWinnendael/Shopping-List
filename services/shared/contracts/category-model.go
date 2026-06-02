package contracts

import "shopping-list/shared/models"

type TrainModelResponse struct {
	Model    string  `json:"model"`
	Accuracy float64 `json:"accuracy"`
}

type CreateCategoryRequest struct {
	Product  string `json:"product" validate:"required"`
	Category string `json:"category" validate:"required"`
}

type CreateCategoryResponse models.CategoryProduct

type GetCategoryResponse models.CategoryProduct
