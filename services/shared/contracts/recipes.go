package contracts

import "shopping-list/shared/models"

type CreateRecipeRequest struct {
	Id           *string             `json:"id"`
	User         string              `json:"user" validate:"required"`
	Title        string              `json:"title" validate:"required"`
	Public       *bool               `json:"public"`
	Banner       *string             `json:"banner"`
	Ingredients  []models.Ingredient `json:"ingredients"`
	Source       *string             `json:"source"`
	Instructions []string            `json:"instructions"`
	Time         *int                `json:"time"`
	MealType     *string             `json:"mealType"`
	Country      *string             `json:"country"`
	Persons      *int                `json:"persons"`
}

type GetRecipeResponse models.Recipe

type CreateRecipeResponse models.Recipe

type GetAllRecipesResponse []models.RecipeSummary

type UpdateRecipeRequest struct {
	User         string              `json:"user" validate:"required"`
	Title        string              `json:"title" validate:"required"`
	Public       *bool               `json:"public"`
	Banner       *string             `json:"banner"`
	Ingredients  []models.Ingredient `json:"ingredients"`
	Source       *string             `json:"source"`
	Instructions []string            `json:"instructions"`
	Time         *int                `json:"time"`
	MealType     *string             `json:"mealType"`
	Country      *string             `json:"country"`
	Persons      *int                `json:"persons"`
}

type UpdateRecipeResponse models.Recipe

type GetRecipesByUserResponse []models.RecipeSummary
type GetDistinctCountriesResponse []string

type DeleteRecipeResponse struct {
	Message string `json:"message"`
	Id      string `json:"id,omitempty"`
}

type GetOnlineRecipesResponse struct {
	Page         int                   `json:"page"`
	MaxPages     int                   `json:"maxPages"`
	TotalRecipes int                   `json:"totalRecipes"`
	Recipes      []models.OnlineRecipe `json:"recipes"`
}

type GetOnlineRecipeDetailsResponse models.OnlineRecipeDetails

type SearchOnlineRecipesResponse GetOnlineRecipesResponse
