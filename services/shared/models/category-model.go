package models

type CategoryProduct struct {
	Category Category `json:"category"`
	Product  string   `json:"product"`
}

type Category string

const (
	CategoryBread           Category = "bread"
	CategoryDrinks          Category = "drinks"
	CategoryHousekeeping    Category = "housekeeping"
	CategoryMeat            Category = "meat"
	CategoryFish            Category = "fish"
	CategoryFruitVegetables Category = "fruit/vegetables"
	CategoryFridge          Category = "fridge"
	CategoryDairy           Category = "dairy"
	CategoryWorld           Category = "world"
	CategoryBreakfast       Category = "breakfast"
	CategorySnacks          Category = "snacks"
	CategoryCarbs           Category = "carbs"
	CategorySugarDesserts   Category = "sugar/desserts"
	CategorySauceSpices     Category = "sauce/spices"
	CategoryPreserved       Category = "preserved"
	CategoryHygiene         Category = "hygiene"
	CategoryFreezer         Category = "freezer"
	CategoryRemaining       Category = "remaining"
)
