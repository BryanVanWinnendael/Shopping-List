// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { MealType } from "./meal_type"

export interface RecipeSummary {
  id: string
  user: string
  title: string
  public: boolean
  banner?: string | null
  time?: number | null
  mealType?: MealType | null
  country?: string | null
  persons?: number | null
}
