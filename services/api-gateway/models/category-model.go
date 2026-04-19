package models

type TrainModelResponse struct {
	Model    string  `json:"model"`
	Accuracy float64 `json:"accuracy"`
}

type AddCategoryRequest struct {
	Item     string `json:"item" validate:"required"`
	Category string `json:"category" validate:"required"`
}

type AddCategoryResponse struct {
	Message  string `json:"message"`
	Item     string `json:"item"`
	Category string `json:"category"`
}

type CategoryResponse struct {
	Category string `json:"category"`
}
