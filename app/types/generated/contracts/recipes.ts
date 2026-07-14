// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { MealType } from "../models/meal_type"
import { Recipe } from "../models/recipe"
import { RecipeSummary } from "../models/recipe_summary"
import { OnlineRecipe } from "../models/online_recipe"
import { OnlineRecipeDetails } from "../models/online_recipe_details"
import { Ingredient } from "../models/ingredient"

export interface CreateRecipeRequest {
  id?: string | null
  user: string
  title: string
  public?: boolean | null
  banner?: string | null
  ingredients?: Ingredient[] | null
  source?: string | null
  instructions?: string[] | null
  time?: number | null
  mealType?: MealType | null
  country?: string | null
  persons?: number | null
}

export type GetRecipeResponse = Recipe

export type CreateRecipeResponse = Recipe

export interface RecipesResponse {
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  recipes: RecipeSummary[]
}

export type GetRecipesResponse = RecipesResponse

export type SearchRecipesResponse = RecipesResponse

export interface UpdateRecipeRequest {
  user: string
  title: string
  public?: boolean | null
  banner?: string | null
  ingredients?: Ingredient[] | null
  source?: string | null
  instructions?: string[] | null
  time?: number | null
  mealType?: MealType | null
  country?: string | null
  persons?: number | null
}

export type UpdateRecipeResponse = Recipe

export type GetRecipesByUserResponse = RecipeSummary[]

export type GetDistinctCountriesResponse = string[]

export interface DeleteRecipeResponse {
  message: string
  id?: string | null
}

export interface GetOnlineRecipesResponse {
  page: number
  maxPages: number
  totalRecipes: number
  recipes: OnlineRecipe[]
}

export type GetOnlineRecipeDetailsResponse = OnlineRecipeDetails

export type SearchOnlineRecipesResponse = GetOnlineRecipesResponse

