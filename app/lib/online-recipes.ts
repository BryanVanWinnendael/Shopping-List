import { httpRequest } from "./httpHelper"
import Toast from "react-native-toast-message"
import { GetOnlineRecipeDetailsResponse, GetOnlineRecipesResponse } from "@/types/generated/contracts/recipes"

const ONLINE_RECIPES_PATH = "/recipes/online"

const getOnlineRecipes = async (page: number): Promise<GetOnlineRecipesResponse | null> => {
    try {
        const params: Record<string, any> = { page }

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

const searchOnlineRecipes = async (q: string, page: number): Promise<GetOnlineRecipesResponse | null> => {
    try {
        const params: Record<string, any> = { q, page }

        const response = await httpRequest<GetOnlineRecipesResponse>({
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
