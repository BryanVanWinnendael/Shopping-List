package models

type CronProduct struct {
	Id       string `json:"id"`
	Category string `json:"category"`
	User     string `json:"user"`
	Product  string `json:"product"`
}
