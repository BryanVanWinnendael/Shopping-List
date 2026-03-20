package models

type RecipeListItem struct {
	URL  *string `json:"url,omitempty"`
	Item string  `json:"item"`
	Type string  `json:"type"`
	ID   *string `json:"id,omitempty"`
}

type JSONList []RecipeListItem

// -------------------
// Recipe model for bbolt storage
// -------------------
type Recipe struct {
	ID        string   `json:"id"`
	CreatedBy string   `json:"created_by"`
	Title     string   `json:"title"`
	Public    *bool    `json:"public,omitempty"`
	Image     *string  `json:"image,omitempty"`
	List      JSONList `json:"list,omitempty"`
	Source    *string  `json:"source,omitempty"`
	Notes     *string  `json:"notes,omitempty"`
	Time      *int     `json:"time,omitempty"`
	MealType  *string  `json:"meal_type,omitempty"`
	Country   *string  `json:"country,omitempty"`
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
