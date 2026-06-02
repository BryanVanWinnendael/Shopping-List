package contracts

import "shopping-list/shared/models"

type CreateCronProductRequest struct {
	Category string `json:"category" validate:"required"`
	User     string `json:"user" validate:"required"`
	Product  string `json:"product" validate:"required"`
}
type CreateCronProductResponse models.CronProduct

type UpdateCronProductCategoryRequest struct {
	Category string `json:"category" validate:"required"`
}

type UpdateCronProductCategoryResponse models.CronProduct

type GetAllCronProductsResponse []models.CronProduct

type GetCronProductsByUserResponse []models.CronProduct

type DeleteCronProductResponse struct {
	Id      string `json:"id"`
	Message string `json:"message,omitempty"`
}
