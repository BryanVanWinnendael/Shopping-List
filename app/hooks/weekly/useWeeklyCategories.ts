import { useCallback, useEffect, useRef, useState } from "react"
import BottomSheet from "@gorhom/bottom-sheet"
import { cronClient } from "@/lib/cron"
import { categoryClient } from "@/lib/category"
import { CronProduct, UpdateCronProductCategoryRequest } from "@/types/cron"
import { Category, CreateCategoryRequest } from "@/types/category-model"

export function useWeeklyCategories() {
    const bottomSheetRef = useRef<BottomSheet>(null)

    const [selectedProduct, setSelectedProduct] = useState<CronProduct | null>(null)
    const [cronProducts, setCronProducts] = useState<CronProduct[]>([])
    const [loading, setLoading] = useState(false)

    const getCronProducts = useCallback(async () => {
        setLoading(true)

        const response = await cronClient.getCronProducts()
        if (response) {
            setCronProducts(response)
        }

        setLoading(false)
    }, [])

    const open = useCallback((cronProduct: CronProduct) => {
        setSelectedProduct(cronProduct)
        bottomSheetRef.current?.expand()
    }, [])

    const close = useCallback(() => {
        setSelectedProduct(null)
        bottomSheetRef.current?.close()
    }, [])

    const updateCategory = async (category: Category) => {
        if (!selectedProduct?.id) return

        const updateRequest: UpdateCronProductCategoryRequest = { category }
        const cronResponse = await cronClient.updateCronProductCategory(selectedProduct.id, updateRequest)

        const createRequest: CreateCategoryRequest = {
            category,
            product: selectedProduct.product,
        }
        await categoryClient.createCategory(createRequest)

        close()
        return cronResponse
    }

    useEffect(() => {
        if (cronProducts.length === 0) getCronProducts()
    }, [])

    return {
        states: {
            loading,
            cronProducts,
        },
        actions: {
            open,
            close,
            updateCategory,
            getCronProducts,
        },
        refs: {
            bottomSheetRef,
        },
    }
}
