import AsyncStorage from "@react-native-async-storage/async-storage"
import { httpRequest } from "./httpHelper"
import Toast from "react-native-toast-message"
import {
    GetOnlineRecipeDetailsResponse,
    GetOnlineRecipesResponse,
    SearchOnlineRecipesResponse,
} from "@/types/generated/contracts/recipes"
import { OnlineRecipe } from "@/types/generated/models/online_recipe"

const ONLINE_RECIPES_PATH = "/recipes/online"
const VIEW_LATER_KEY = "app_onlineRecipeViewLater"

export type OnlineRecipeFilter = {
    kitchens: string[]
    courses: string[]
    dishes: string[]
    specials: string[]
}

// Empty groups are left out so the backend can tell "not filtered" from "filtered
// with nothing selected".
const onlineRecipeFilterParams = (filter: OnlineRecipeFilter): Record<string, string[]> => ({
    ...(filter.kitchens.length ? { kitchen: filter.kitchens } : {}),
    ...(filter.courses.length ? { course: filter.courses } : {}),
    ...(filter.dishes.length ? { dish: filter.dishes } : {}),
    ...(filter.specials.length ? { special: filter.specials } : {}),
})

export const getViewLaterRecipes = async (): Promise<OnlineRecipe[]> => {
    try {
        const stored = await AsyncStorage.getItem(VIEW_LATER_KEY)

        if (!stored) return []

        return JSON.parse(stored) as OnlineRecipe[]
    } catch {
        return []
    }
}

export const setViewLaterRecipes = async (recipes: OnlineRecipe[]) => {
    await AsyncStorage.setItem(VIEW_LATER_KEY, JSON.stringify(recipes))
}

const getOnlineRecipes = async (filter: OnlineRecipeFilter, page: number): Promise<GetOnlineRecipesResponse | null> => {
    try {
        const params: Record<string, any> = { page, ...onlineRecipeFilterParams(filter) }

        const response = await httpRequest<GetOnlineRecipesResponse>({
            url: ONLINE_RECIPES_PATH,
            params,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to get online recipes",
        })
        return null
    }
}

const getOnlineRecipeDetails = async (url: string): Promise<GetOnlineRecipeDetailsResponse | null> => {
    try {
        const params: Record<string, any> = { url }

        const response = await httpRequest<GetOnlineRecipeDetailsResponse>({
            url: `${ONLINE_RECIPES_PATH}/details`,
            params,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to get online recipe details",
        })
        return null
    }
}

const searchOnlineRecipes = async (
    query: string,
    filter: OnlineRecipeFilter,
    page: number
): Promise<SearchOnlineRecipesResponse | null> => {
    try {
        const params: Record<string, any> = { query, page, ...onlineRecipeFilterParams(filter) }

        const response = await httpRequest<SearchOnlineRecipesResponse>({
            url: `${ONLINE_RECIPES_PATH}/search`,
            params,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to search online recipes",
        })
        return null
    }
}

export const onlineRecipesClient = {
    getOnlineRecipes,
    getOnlineRecipeDetails,
    searchOnlineRecipes,
}
