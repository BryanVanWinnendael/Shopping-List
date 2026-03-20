package models

type Item struct {
	Item     string `json:"item"`
	Type     string `json:"type"`
	AddedBy  string `json:"addedBy"`
	AddedAt  int64  `json:"addedAt"`
	ID       string `json:"id"`
	Category string `json:"category"`
}

type CronItem struct {
	Category string `gorm:"type:varchar(255);not null" json:"category"`
	AddedBy  string `gorm:"type:varchar(255);not null" json:"addedBy"`
	Item     string `gorm:"type:text;not null" json:"item"`
}
