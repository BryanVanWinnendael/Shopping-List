package models

// CronProduct represents an entry that goes into Firebase
type CronProduct struct {
	Product  string `json:"product"`
	Type     string `json:"type"`
	AddedBy  string `json:"addedBy"`
	AddedAt  int64  `json:"addedAt"`
	Id       string `json:"id"`
	Category string `json:"category"`
}
