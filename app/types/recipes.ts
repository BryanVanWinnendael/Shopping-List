import * as ImagePicker from "expo-image-picker"
import { MealType } from "@/types/generated/models/meal_type"
import { Ingredient as GeneratedIngredient } from "@/types/generated/models/ingredient"
import {
    CreateRecipeRequest as GeneratedCreateRecipeRequest,
    UpdateRecipeRequest as GeneratedUpdateRecipeRequest,
} from "@/types/generated/contracts/recipes"

export type Ingredient = GeneratedIngredient & {
    image?: ImagePicker.ImagePickerAsset
}

export type CreateRecipeRequest = GeneratedCreateRecipeRequest & {
    image?: ImagePicker.ImagePickerAsset | null
    countryObject?: Country | null
}

export type UpdateRecipeRequest = GeneratedUpdateRecipeRequest & {
    id: string
    image?: ImagePicker.ImagePickerAsset | null
    countryObject?: Country | null
}

export type FilterStates = {
    public: boolean
    mealType: MealType
    country: string
    time: number | null
}

export type Country = {
    name: string
    flag: string
}
