import { create } from "zustand"
import { ProductsSearchResponse } from "@/types/products-search"

type SearchProductsState = {
    query: string | null
    setQuery: (query: string | null) => void
    products: ProductsSearchResponse
    setProducts: (products: ProductsSearchResponse) => void
    found: number
    setFound: (found: number) => void
}

export const useProductsSearchStore = create<SearchProductsState>((set) => ({
    products: {
        products: [],
        dateUpdated: "",
        page: 0,
        pageSize: 0,
        total: 0,
        totalPages: 0,
        category: "remaining",
        product: "",
    },
    query: null,
    found: 0,

    setProducts: (products: ProductsSearchResponse) => {
        set({ products })
    },

    setQuery: (query: string | null) => {
        set({ query })
    },

    setFound: (found: number) => {
        set({ found })
    },
}))
