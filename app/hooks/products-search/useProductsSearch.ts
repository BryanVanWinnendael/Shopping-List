import { useCallback, useRef, useState } from "react"
import { productsSearchClient } from "@/lib/product-search"
import { Category } from "@/types/category-model"
import { ProductsSearchResponse } from "@/types/products-search"
import BottomSheet from "@gorhom/bottom-sheet"
import { useProductsSearchStore } from "@/stores/useProductsSearchStore"

const EMPTY_RESULT: ProductsSearchResponse = {
    products: [],
    dateUpdated: "",
    page: 0,
    pageSize: 0,
    total: 0,
    totalPages: 0,
    category: "remaining",
    product: "",
}

export function useProductsSearch() {
    const { setFound } = useProductsSearchStore()
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
    const isFetching = useRef(false)

    const [query, setQuery] = useState("")
    const [results, setResults] = useState<ProductsSearchResponse>(EMPTY_RESULT)
    const [loading, setLoading] = useState(false)
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([])

    const bottomSheetRef = useRef<BottomSheet>(null)

    const open = useCallback(() => {
        bottomSheetRef.current?.expand()
    }, [])

    const close = useCallback(() => {
        bottomSheetRef.current?.close()
    }, [])

    const fetchProducts = useCallback(async (text: string, categories: Category[], page = 1, replace = false) => {
        if (!text.trim()) {
            setFound(0)
            setResults(EMPTY_RESULT)
            return
        }

        if (isFetching.current) return
        isFetching.current = true

        if (replace) setLoading(true)

        const response = await productsSearchClient.searchProducts(text, page, categories)
        if (response) {
            setFound(response.total)
            setResults((prev) =>
                replace
                    ? response
                    : {
                          ...prev,
                          ...response,
                          products: [...prev.products, ...response.products],
                      }
            )
        }

        setLoading(false)
        isFetching.current = false
    }, [])

    const updateQuery = (text: string) => {
        setQuery(text)

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }

        debounceTimeout.current = setTimeout(async () => {
            await fetchProducts(text, selectedCategories, 1, true)
        }, 500)
    }

    const applyFilters = async (categories: Category[]) => {
        setSelectedCategories(categories)

        if (query.trim()) {
            await fetchProducts(query, categories, 1, true)
        }
    }

    const fetchNextPage = async () => {
        if (results.page >= results.totalPages) return
        await fetchProducts(query, selectedCategories, results.page + 1, false)
    }

    return {
        states: {
            query,
            results,
            loading,
            selectedCategories,
        },
        actions: {
            updateQuery,
            applyFilters,
            fetchNextPage,
            close,
            open,
        },
        refs: {
            bottomSheetRef,
        },
    }
}
