import AsyncStorage from "@react-native-async-storage/async-storage"
import { httpRequest } from "./httpHelper"
import { User } from "@/types"
import Toast from "react-native-toast-message"
import {
    CreateRecipeRequest,
    CreateRecipeResponse,
    DeleteRecipeResponse,
    GetDistinctCountriesResponse,
    GetRecipeResponse,
    GetRecipesByUserResponse,
    GetRecipesResponse,
    SearchRecipesResponse,
    UpdateRecipeRequest,
    UpdateRecipeResponse,
} from "@/types/generated/contracts/recipes"
import { RecipeSummary } from "@/types/generated/models/recipe_summary"
import { FilterStates } from "@/types/recipes"

const RECIPES_PATH = "/recipes"
const FAVORITE_RECIPES_KEY = "app_favoriteRecipes"
const ACTIVE_RECIPE_FILTER_KEY = "app_recipeFilter"

const getRecipes = async (user: User, page: number, filters: FilterStates): Promise<GetRecipesResponse | null> => {
    try {
        const response = await httpRequest<GetRecipesResponse>({
            url: RECIPES_PATH,
            method: "GET",
            params: buildRecipeParams(user, page, filters),
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to get recipes",
        })
        return null
    }
}

const createRecipe = async (request: CreateRecipeRequest): Promise<CreateRecipeResponse | null> => {
    try {
        const response = await httpRequest<CreateRecipeResponse>({
            url: RECIPES_PATH,
            method: "POST",
            body: request,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to create recipe",
        })
        return null
    }
}

const getRecipe = async (id: string): Promise<GetRecipeResponse | null> => {
    try {
        const response = await httpRequest<GetRecipeResponse>({
            url: `${RECIPES_PATH}/${id}`,
            method: "GET",
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to get recipe",
        })
        return null
    }
}

const getUserRecipes = async (user: User): Promise<GetRecipesByUserResponse | null> => {
    try {
        const response = await httpRequest<GetRecipesByUserResponse>({
            url: `${RECIPES_PATH}/users/${user}`,
            method: "GET",
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to get recipes",
        })
        return null
    }
}

const deleteRecipe = async (id: string): Promise<DeleteRecipeResponse | null> => {
    try {
        const response = await httpRequest<DeleteRecipeResponse>({
            url: `${RECIPES_PATH}/${id}`,
            method: "DELETE",
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to delete recipe",
        })
        return null
    }
}

const updateRecipe = async (id: string, request: UpdateRecipeRequest): Promise<UpdateRecipeResponse | null> => {
    try {
        const response = await httpRequest<UpdateRecipeResponse>({
            url: `${RECIPES_PATH}/${id}`,
            method: "PUT",
            body: request,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to update recipe",
        })
        return null
    }
}

const getRecipesCountries = async (): Promise<GetDistinctCountriesResponse | null> => {
    try {
        const response = await httpRequest<GetDistinctCountriesResponse>({
            url: `${RECIPES_PATH}/countries`,
            method: "GET",
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to get recipes countries",
        })
        return null
    }
}

const searchRecipes = async (
    user: User,
    page: number,
    query: string,
    filters: FilterStates
): Promise<SearchRecipesResponse | null> => {
    try {
        const response = await httpRequest<SearchRecipesResponse>({
            url: `${RECIPES_PATH}/search`,
            method: "GET",
            params: buildRecipeParams(user, page, filters, query),
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to get recipes",
        })
        return null
    }
}

const buildRecipeParams = (user: User, page: number, filters: FilterStates, query?: string) => {
    const params: Record<string, string | number | boolean | User> = {
        user,
        page,
        public: filters.public,
    }

    const trimmedQuery = query?.trim()
    if (trimmedQuery) {
        params.query = trimmedQuery
    }

    const country = filters.country?.trim()
    if (country && country !== "Any") {
        params.country = country
    }

    if (filters.mealType !== "Any") {
        params.mealType = filters.mealType
    }

    if (filters.time != null && filters.time > 0) {
        params.time = filters.time
    }

    if (filters.isSaved !== undefined) {
        params.isSaved = filters.isSaved
    }

    return params
}

export const getFavoriteRecipes = async () => {
    const storedFavoriteRecipes = await AsyncStorage.getItem(FAVORITE_RECIPES_KEY)
    if (!storedFavoriteRecipes) return []
    return JSON.parse(storedFavoriteRecipes) as RecipeSummary[]
}

export const setFavoriteRecipes = async (recipes: RecipeSummary[]) => {
    await AsyncStorage.setItem(FAVORITE_RECIPES_KEY, JSON.stringify(recipes))
}

export const setActiveRecipeFilter = async (filter: any) => {
    await AsyncStorage.setItem(ACTIVE_RECIPE_FILTER_KEY, JSON.stringify(filter))
}

export const getActiveRecipeFilter = async (): Promise<any> => {
    const storedFilter = await AsyncStorage.getItem(ACTIVE_RECIPE_FILTER_KEY)
    if (!storedFilter) return null
    return JSON.parse(storedFilter)
}

export const recipesClient = {
    getRecipes,
    deleteRecipe,
    updateRecipe,
    getRecipesCountries,
    createRecipe,
    getUserRecipes,
    getRecipe,
    searchRecipes,
}
