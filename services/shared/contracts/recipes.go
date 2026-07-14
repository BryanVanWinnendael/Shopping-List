package contracts

import "shopping-list/shared/models"

type CreateRecipeRequest struct {
	Id           *string             `json:"id,omitempty"`
	User         string              `json:"user" validate:"required"`
	Title        string              `json:"title" validate:"required"`
	Public       *bool               `json:"public,omitempty"`
	Banner       *string             `json:"banner,omitempty"`
	Ingredients  []models.Ingredient `json:"ingredients,omitempty"`
	Source       *string             `json:"source,omitempty"`
	Instructions []string            `json:"instructions,omitempty"`
	Time         *int                `json:"time,omitempty"`
	MealType     *models.MealType    `json:"mealType,omitempty"`
	Country      *string             `json:"country,omitempty"`
	Persons      *int                `json:"persons,omitempty"`
}

type GetRecipeResponse models.Recipe

type CreateRecipeResponse models.Recipe

type RecipesResponse struct {
	Total      int                    `json:"total"`
	Page       int                    `json:"page"`
	PageSize   int                    `json:"pageSize"`
	TotalPages int                    `json:"totalPages"`
	HasNext    bool                   `json:"hasNext"`
	Recipes    []models.RecipeSummary `json:"recipes"`
}

type GetRecipesResponse RecipesResponse

type SearchRecipesResponse RecipesResponse

type UpdateRecipeRequest struct {
	User         string              `json:"user" validate:"required"`
	Title        string              `json:"title" validate:"required"`
	Public       *bool               `json:"public,omitempty"`
	Banner       *string             `json:"banner,omitempty"`
	Ingredients  []models.Ingredient `json:"ingredients,omitempty"`
	Source       *string             `json:"source,omitempty"`
	Instructions []string            `json:"instructions,omitempty"`
	Time         *int                `json:"time,omitempty"`
	MealType     *models.MealType    `json:"mealType,omitempty"`
	Country      *string             `json:"country,omitempty"`
	Persons      *int                `json:"persons,omitempty"`
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
