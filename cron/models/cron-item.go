package models

// Item represents an entry that goes into Firebase
type Item struct {
	Item     string `json:"item"`
	Type     string `json:"type"`
	AddedBy  string `json:"addedBy"`
	AddedAt  int64  `json:"addedAt"`
	ID       string `json:"id"`
	Category string `json:"category"`
}

// CronItem represents an item stored in the CronService database (bbolt)
type CronItem struct {
	ID       string `json:"id"`
	Category string `json:"category"`
	AddedBy  string `json:"addedBy"`
	Item     string `json:"item"`
}

type UpdateCronItemRequest struct {
	Category string `json:"category" validate:"required"`
}
