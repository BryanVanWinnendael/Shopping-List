import { useCallback, useRef, useState } from "react"
import BottomSheet from "@gorhom/bottom-sheet"
import { cronClient } from "@/lib/cron"
import { categoryClient } from "@/lib/category"
import { CronProduct, UpdateCronProductCategoryRequest } from "@/types/cron"
import { Category, CreateCategoryRequest } from "@/types/category-model"

export function useWeeklyCategories() {
    const bottomSheetRef = useRef<BottomSheet>(null)

    const [selectedProduct, setSelectedProduct] = useState<CronProduct | null>(null)

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

    return {
        actions: {
            open,
            close,
            updateCategory,
        },
        refs: {
            bottomSheetRef,
        },
    }
}
