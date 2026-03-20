package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type RecipeListItem struct {
	URL  *string `json:"url,omitempty"`
	Item string  `json:"item"`
	Type string  `json:"type"`
	ID   *string `json:"id,omitempty"`
}

type JSONList []RecipeListItem

func (j JSONList) Value() (driver.Value, error) {
	if len(j) == 0 {
		return nil, nil
	}
	return json.Marshal(j)
}

func (j *JSONList) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("failed to scan JSONList")
	}
	return json.Unmarshal(bytes, j)
}

// -------------------
// Recipe model (GORM)
// -------------------
type Recipe struct {
	ID        string   `gorm:"primaryKey;size:50" json:"id"`
	CreatedBy string   `gorm:"size:50;not null" json:"created_by"`
	Title     string   `gorm:"size:255;not null" json:"title"`
	Public    *bool     `gorm:"default:true" json:"public"`
	Image     *string  `gorm:"type:text" json:"image,omitempty"`
	List      JSONList `gorm:"type:json" json:"list,omitempty"`
	Source    *string  `gorm:"size:255" json:"source,omitempty"`
	Notes     *string  `gorm:"type:text" json:"notes,omitempty"`
	Time      *int     `json:"time,omitempty"`
	MealType  *string  `gorm:"size:100" json:"meal_type,omitempty"`
	Country   *string  `gorm:"size:100" json:"country,omitempty"`
}

// -------------------
// RecipeCreate for POST requests
// -------------------
type RecipeCreate struct {
	ID        string           `json:"id" validate:"required"`
	CreatedBy string           `json:"created_by" validate:"required"`
	Title     string           `json:"title" validate:"required"`
	Public    *bool            `json:"public"`
	Image     *string          `json:"image"`
	List      []RecipeListItem `json:"list"`
	Source    *string          `json:"source"`
	Notes     *string          `json:"notes"`
	Time      *int             `json:"time"`
	MealType  *string          `json:"meal_type"`
	Country   *string          `json:"country"`
}

// -------------------
// RecipeUpdate for PUT requests
// -------------------
type RecipeUpdate struct {
	Title    *string           `json:"title"`
	Public   *bool             `json:"public"`
	Image    *string           `json:"image"`
	List     *[]RecipeListItem `json:"list"`
	Source   *string           `json:"source"`
	Notes    *string           `json:"notes"`
	Time     *int              `json:"time"`
	MealType *string           `json:"meal_type"`
	Country  *string           `json:"country"`
}
