package models

type Ingredient struct {
	URL     *string `json:"url,omitempty"`
	Product *string `json:"product,omitempty"`
	Type    string  `json:"type" validate:"required"`
}

type Recipe struct {
	Id           string       `json:"id"`
	User         string       `json:"user"`
	Title        string       `json:"title"`
	Public       *bool        `json:"public"`
	Banner       *string      `json:"banner,omitempty"`
	Ingredients  []Ingredient `json:"ingredients,omitempty"`
	Source       *string      `json:"source,omitempty"`
	Instructions []string     `json:"instructions,omitempty"`
	Time         *int         `json:"time,omitempty"`
	MealType     *string      `json:"mealType,omitempty"`
	Country      *string      `json:"country,omitempty"`
	Persons      *int         `json:"persons,omitempty"`
}

type RecipeSummary struct {
	Id       string  `json:"id"`
	User     string  `json:"user"`
	Title    string  `json:"title"`
	Public   *bool   `json:"public"`
	Banner   *string `json:"banner,omitempty"`
	Time     *int    `json:"time,omitempty"`
	MealType *string `json:"mealType,omitempty"`
	Country  *string `json:"country,omitempty"`
	Persons  *int    `json:"persons,omitempty"`
}

type OnlineRecipe struct {
	Title string `json:"title"`
	URL   string `json:"url"`
	Image string `json:"image"`
}

type OnlineRecipeDetails struct {
	Title        string    `json:"title"`
	Image        string    `json:"image"`
	Ingredients  []string  `json:"ingredients"`
	Instructions []string  `json:"instructions"`
	Nutrition    Nutrition `json:"nutrition"`
	Source       string    `json:"source"`
	Time         int       `json:"time"`
	Persons      int       `json:"persons"`
}

type Nutrition struct {
	Calories      string `json:"calories,omitempty"`
	Carbohydrates string `json:"carbohydrates,omitempty"`
	Sugars        string `json:"sugars,omitempty"`
	Fat           string `json:"fat,omitempty"`
	SaturatedFat  string `json:"saturatedFat,omitempty"`
	Protein       string `json:"protein,omitempty"`
	Fiber         string `json:"fiber,omitempty"`
}
