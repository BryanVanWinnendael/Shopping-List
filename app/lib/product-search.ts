import { Categories, ProductsSearchResult } from "@/types"
import { httpRequest } from "./httpHelper"

const PRODUCT_SEARCH_PATH = "products-search/search"
const DEFAULT_RESPONSE = {
  products: [],
  dateUpdated: "",
  page: 0,
  pageSize: 0,
  total: 0,
  totalPages: 0,
  category: "remaining",
  item: "",
} as ProductsSearchResult

export const searchProducts = async (
  q: string,
  page: number,
  categories?: Categories[],
): Promise<ProductsSearchResult> => {
  try {
    const params: Record<string, any> = { q, page }
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
    return DEFAULT_RESPONSE
  }
}

export const fuzzySearchProducts = async (
  q: string,
  category: Categories,
  page: number,
): Promise<ProductsSearchResult> => {
  try {
    const response = await httpRequest<ProductsSearchResult>({
      url: `${PRODUCT_SEARCH_PATH}/fuzzy`,
      method: "GET",
      params: { q, category, page },
    })

    return response.data
  } catch (error) {
    console.error("Error performing fuzzy search:", error)
    return DEFAULT_RESPONSE
  }
}
