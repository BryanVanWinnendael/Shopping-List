import { httpRequest } from "./httpHelper"
import { CreateCategoryRequest, CreateCategoryResponse, GetCategoryResponse } from "@/types/category-model"
import Toast from "react-native-toast-message"

const CATEGORY_PATH = "category-model/category"

const getCategory = async (product: string): Promise<GetCategoryResponse | null> => {
    try {
        const response = await httpRequest<GetCategoryResponse>({
            url: CATEGORY_PATH,
            method: "GET",
            params: { product },
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to get category",
        })
        return null
    }
}

const createCategory = async (request: CreateCategoryRequest): Promise<CreateCategoryResponse | null> => {
    try {
        const response = await httpRequest<CreateCategoryResponse>({
            url: CATEGORY_PATH,
            method: "POST",
            body: request,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to create category",
        })
        return null
    }
}

export const categoryClient = {
    getCategory,
    createCategory,
}
