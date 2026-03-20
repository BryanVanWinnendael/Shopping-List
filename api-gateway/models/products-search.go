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
}
