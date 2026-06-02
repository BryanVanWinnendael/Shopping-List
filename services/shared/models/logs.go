package models

type Log struct {
	Date   string `json:"date"`
	Text   string `json:"text"`
	User   string `json:"user"`
	Action string `json:"action"`
	Error  *bool  `json:"error,omitempty"`
}
