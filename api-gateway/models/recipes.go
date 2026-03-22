package models

type RecipeListItem struct {
	URL  *string `json:"url,omitempty"`
	Item string  `json:"item"`
	Type string  `json:"type"`
	ID   *string `json:"id,omitempty"`
}

type Recipe struct {
	ID        string           `json:"id"`
	CreatedBy string           `json:"createdBy"`
	Title     string           `json:"title"`
	Public    *bool            `json:"public"`
	Image     *string          `json:"image"`
	List      []RecipeListItem `json:"list"`
	Source    *string          `json:"source"`
	Notes     *string          `json:"notes"`
	Time      *int             `json:"time"`
	MealType  *string          `json:"mealType"`
	Country   *string          `json:"country"`
}
