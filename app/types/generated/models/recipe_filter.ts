// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { MealType } from "./meal_type"

export interface RecipeFilter {
  query: string
  country?: string | null
  mealType?: MealType | null
  public?: boolean | null
  time?: number | null
  isSaved?: boolean | null
}
