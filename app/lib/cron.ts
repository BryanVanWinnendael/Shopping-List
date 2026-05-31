import {httpRequest} from "./httpHelper"
import {
    CreateCronProductRequest,
    CreateCronProductResponse,
    DeleteCronProductResponse,
    GetAllCronProductsResponse,
    GetCronProductsByUserResponse,
    UpdateCronProductCategoryRequest,
    UpdateCronProductCategoryResponse,
} from "@/types/cron"
import {User} from "@/types"
import Toast from "react-native-toast-message"

const CRON_PATH = "cron"

const getCronProductsByUser = async (user: User): Promise<GetCronProductsByUserResponse | null> => {
    try {
        const response = await httpRequest<GetCronProductsByUserResponse>({
            url: `${CRON_PATH}/users/${user}`,
            method: "GET",
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to get weekly products",
        })
        return null
    }
}

const getCronProducts = async (): Promise<GetAllCronProductsResponse | null> => {
    try {
        const response = await httpRequest<GetAllCronProductsResponse>({
            url: CRON_PATH,
            method: "GET",
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to get all weekly products",
        })
        return null
    }
}

const createCronProduct = async (request: CreateCronProductRequest): Promise<CreateCronProductResponse | null> => {
    try {
        const response = await httpRequest<CreateCronProductResponse>({
            url: CRON_PATH,
            method: "POST",
            body: request,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to create weekly product",
        })
        return null
    }
}

const deleteCronProduct = async (id: string): Promise<DeleteCronProductResponse | null> => {
    try {
        const response = await httpRequest<DeleteCronProductResponse>({
            url: `${CRON_PATH}/${id}`,
            method: "DELETE",
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to delete weekly product",
        })
        return null
    }
}

const updateCronProductCategory = async (
    id: string,
    request: UpdateCronProductCategoryRequest
): Promise<UpdateCronProductCategoryResponse | null> => {
    try {
        const response = await httpRequest<UpdateCronProductCategoryResponse>({
            url: `${CRON_PATH}/${id}`,
            method: "PUT",
            body: request,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to update weekly product",
        })
        return null
    }
}

export const cronClient = {
    getCronProductsByUser,
    getCronProducts,
    createCronProduct,
    deleteCronProduct,
    updateCronProductCategory,
}
