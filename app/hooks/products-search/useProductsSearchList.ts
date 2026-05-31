import { useCallback, useEffect, useRef } from "react"
import BottomSheet from "@gorhom/bottom-sheet"
import { FlatList } from "react-native"
import { useProductsSearchStore } from "@/stores/useProductsSearchStore"
import { productsSearchClient } from "@/lib/product-search"
import { Category } from "@/types/category-model"

export function useProductsSearchList() {
    const { products: response, setProducts, setQuery } = useProductsSearchStore()

    const bottomSheetRef = useRef<BottomSheet>(null)
    const flatListRef = useRef<FlatList>(null)
    const isFetching = useRef(false)

    const { page, totalPages, product, category, products } = response

    const open = useCallback(() => {
        setQuery(null)
        bottomSheetRef.current?.expand()
    }, [])

    const close = useCallback(() => {
        bottomSheetRef.current?.close()
    }, [])

    const getNextPage = useCallback(async () => {
        const nextPage = page + 1

        if (nextPage > totalPages) return
        if (isFetching.current) return

        isFetching.current = true

        const res = await productsSearchClient.fuzzySearchProducts(product, category, nextPage)
        if (res) {
            setProducts({
                ...res,
                products: [...products, ...res.products],
            })
        }

        isFetching.current = false
    }, [response])

    const searchProduct = async (product: string, category: Category) => {
        const res = await productsSearchClient.fuzzySearchProducts(product, category, 0)
        if (!res) return
        setProducts(res)
    }

    useEffect(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
    }, [product, category])

    return {
        states: {
            bottomSheetRef,
            response,
            products: response.products,
            total: response.total,
            dateUpdated: response.dateUpdated,
        },
        actions: {
            close,
            open,
            getNextPage,
            setQuery,
            searchProduct,
        },
        refs: {
            flatListRef,
        },
    }
}
