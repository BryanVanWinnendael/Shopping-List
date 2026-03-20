package models

type Product struct {
	PID      string `json:"pid"`
	Item     string `json:"item"`
	Brand    string `json:"brand"`
	Category string `json:"category"`
	Image    string `json:"image"`
}

type ProductsSearchResult struct {
	Products    []Product `json:"products"`
	DateUpdated string    `json:"date_updated"`
	Total       int       `json:"total"`
	Page        int       `json:"page"`
	PageSize    int       `json:"page_size"`
	TotalPages  int       `json:"total_pages"`
	Item        string    `json:"item"`
	Category    string    `json:"category"`
}

type ScoredProduct struct {
	Product Product
	Score   int
}
