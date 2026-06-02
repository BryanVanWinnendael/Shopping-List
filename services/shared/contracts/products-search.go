package contracts

import "shopping-list/shared/models"

type ProductsSearchResponse struct {
	Products    []models.Product `json:"products"`
	DateUpdated string           `json:"dateUpdated"`
	Total       int              `json:"total"`
	Page        int              `json:"page"`
	PageSize    int              `json:"pageSize"`
	TotalPages  int              `json:"totalPages"`
	Product     string           `json:"product"`
	Category    string           `json:"category"`
}
