import { httpRequest } from "./httpHelper"
import Toast from "react-native-toast-message"
import { Category } from "@/types/generated/models/category"
import { ProductsSearchResponse } from "@/types/generated/contracts/products-search"

const PRODUCT_SEARCH_PATH = "products-search/search"

const searchProducts = async (
    query: string,
    page: number,
    categories?: Category[]
): Promise<ProductsSearchResponse | null> => {
    try {
        const params: Record<string, any> = { query, page }
        if (categories?.length) {
            params.category = categories
        }

        const response = await httpRequest<ProductsSearchResponse>({
            url: PRODUCT_SEARCH_PATH,
            method: "GET",
            params,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to search products",
        })
        return null
    }
}

const fuzzySearchProducts = async (
    query: string,
    category: Category,
    page: number
): Promise<ProductsSearchResponse | null> => {
    try {
        const response = await httpRequest<ProductsSearchResponse>({
            url: `${PRODUCT_SEARCH_PATH}/fuzzy`,
            method: "GET",
            params: { query, category, page },
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to search products",
        })
        return null
    }
}

export const productsSearchClient = {
    searchProducts,
    fuzzySearchProducts,
}
