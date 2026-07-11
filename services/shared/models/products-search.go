package models

type Product struct {
	PID      string   `json:"pid"`
	Name     string   `json:"name"`
	Brand    string   `json:"brand"`
	Category Category `json:"category"`
	Image    string   `json:"image"`
}
