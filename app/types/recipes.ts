import * as ImagePicker from "expo-image-picker"

export type Ingredient = {
    url?: string | null
    product?: string | null
    image?: ImagePicker.ImagePickerAsset
    type: string
}

export type Recipe = {
    id: string
    user: string
    title: string
    public?: boolean | null
    banner?: string | null
    ingredients?: Ingredient[]
    source?: string | null
    instructions?: string[] | null
    time?: number | null
    mealType?: MealType | null
    country?: string | null
    persons?: number | null
}

export type RecipeSummary = {
    id: string
    user: string
    title: string
    public?: boolean | null
    banner?: string | null
    time?: number | null
    mealType?: MealType | null
    country?: string | null
    persons?: number | null
}

export type CreateRecipeRequest = {
    id?: string | null
    user: string
    title: string
    public?: boolean | null
    banner?: string | null
    image?: ImagePicker.ImagePickerAsset | null
    ingredients: Ingredient[]
    source?: string | null
    instructions?: string[] | null
    time?: number | null
    mealType?: MealType | null
    country?: string | null
    countryObject?: Country | null
    persons?: number | null
}

export type GetRecipeResponse = Recipe

export type CreateRecipeResponse = Recipe

export type GetAllRecipesResponse = RecipeSummary[]

export type UpdateRecipeRequest = {
    id: string
    user: string
    title: string
    public?: boolean | null
    banner?: string | null
    image?: ImagePicker.ImagePickerAsset | null
    ingredients: Ingredient[]
    source?: string | null
    instructions?: string[] | null
    time?: number | null
    mealType?: MealType | null
    country?: string | null
    countryObject?: Country | null
    persons?: number | null
}

export type UpdateRecipeResponse = Recipe

export type GetRecipesByUserResponse = Recipe[]

export type GetDistinctCountriesResponse = string[]

export type DeleteRecipeResponse = {
    message: string
    id?: string
}

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Dessert" | "Any"

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

export type OnlineRecipe = {
    title: string
    image: string
    url?: string
    ingredients?: string[]
    instructions?: string[]
    nutrition?: Nutrition
    source?: string
    time?: number
    persons?: number
}

export type GetOnlineRecipesResponse = {
    page: number
    maxPages: number
    totalRecipes: number
    recipes: OnlineRecipe[]
}

export type Nutrition = {
    calories: string
    carbohydrates: string
    sugars: string
    fat: string
    saturatedFat: string
    protein: string
    fiber: string
}

export type GetOnlineRecipesDetailsResponse = {
    title: string
    image: string
    ingredients: string[]
    instructions: string[]
    nutrition: Nutrition
    source: string
    time: number
    persons: number
}
