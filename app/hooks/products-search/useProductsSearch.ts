import { useCallback, useEffect, useRef, useState } from "react"
import { productsSearchClient } from "@/lib/product-search"
import BottomSheet from "@gorhom/bottom-sheet"
import { Category } from "@/types/generated/models/category"
import { ProductsSearchResponse } from "@/types/generated/contracts/products-search"
import { useHeaderStore } from "@/stores/useHeaderStore"
import { DEBOUNCE_TIME } from "@/lib/constants"

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
    const { setText } = useHeaderStore()
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

    const getProducts = useCallback(async (query: string, categories: Category[], page = 1, replace = false) => {
        if (isFetching.current) return
        isFetching.current = true

        if (replace) setLoading(true)

        const response = await productsSearchClient.searchProducts(query, page, categories)
        if (response) {
            setText("searchProducts", `${response.total} Products`)
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
            await getProducts(text, selectedCategories, 1, true)
        }, DEBOUNCE_TIME)
    }

    const applyFilters = async (categories: Category[]) => {
        setSelectedCategories(categories)
        await getProducts(query, categories, 1, true)
    }

    const getNextPage = async () => {
        if (results.page >= results.totalPages) return
        await getProducts(query, selectedCategories, results.page + 1, false)
    }

    useEffect(() => {
        getProducts("", [])
    }, [getProducts])

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
            getNextPage,
            close,
            open,
        },
        refs: {
            bottomSheetRef,
        },
    }
}
