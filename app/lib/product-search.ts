import { Categories, ProductsSearchResult } from "@/types"
import { httpRequest } from "./httpHelper"

const PRODUCT_SEARCH_PATH = "products-search/search"

export const searchProducts = async (
  q: string,
  categories?: Categories[],
): Promise<ProductsSearchResult> => {
  try {
    const params: Record<string, any> = { q }
    if (categories?.length) {
      params.category = categories
    }

    const response = await httpRequest<ProductsSearchResult>({
      url: PRODUCT_SEARCH_PATH,
      method: "GET",
      params,
    })

    return response.data
  } catch (error) {
    console.error("Error searching products:", error)
    return { products: [], dateUpdated: "" }
  }
}

export const fuzzySearchProducts = async (
  q: string,
  category: Categories,
): Promise<ProductsSearchResult> => {
  try {
    const response = await httpRequest<ProductsSearchResult>({
      url: `${PRODUCT_SEARCH_PATH}/fuzzy`,
      method: "GET",
      params: { q, category },
    })

    return response.data
  } catch (error) {
    console.error("Error performing fuzzy search:", error)
    return { products: [], dateUpdated: "" }
  }
}
