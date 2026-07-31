// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { Ingredient } from "./ingredient"
import { MealType } from "./meal_type"

export interface Recipe {
  id: string
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
