package models

// CronProduct represents an entry that goes into Firebase
type CronProduct struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	User     string `json:"user"`
	Date     int64  `json:"date"`
	Id       string `json:"id"`
	Category string `json:"category"`
}
