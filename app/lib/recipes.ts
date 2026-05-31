import AsyncStorage from "@react-native-async-storage/async-storage"
import { httpRequest } from "./httpHelper"
import {
    CreateRecipeRequest,
    CreateRecipeResponse,
    DeleteRecipeResponse,
    GetAllRecipesResponse,
    GetDistinctCountriesResponse,
    GetRecipeResponse,
    GetRecipesByUserResponse,
    UpdateRecipeRequest,
    UpdateRecipeResponse,
} from "@/types/recipes"
import { User } from "@/types"
import Toast from "react-native-toast-message"

const RECIPES_PATH = "/recipes"
const FAVORITE_RECIPES_KEY = "app_favoriteRecipes"
const ACTIVE_RECIPE_FILTER_KEY = "app_recipeFilter"

const getRecipes = async (): Promise<GetAllRecipesResponse | null> => {
    try {
        const response = await httpRequest<GetAllRecipesResponse>({
            url: RECIPES_PATH,
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

export const getFavoriteRecipes = async () => {
    const storedFavoriteRecipes = await AsyncStorage.getItem(FAVORITE_RECIPES_KEY)
    if (!storedFavoriteRecipes) return []
    return JSON.parse(storedFavoriteRecipes)
}

export const setFavoriteRecipes = async (recipes: string[]) => {
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
}
