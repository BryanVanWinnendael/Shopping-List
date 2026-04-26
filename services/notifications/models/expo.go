package models

type ExpoPushRequest struct {
	To    string `json:"to"`
	Title string `json:"title"`
	Body  string `json:"body"`
}
