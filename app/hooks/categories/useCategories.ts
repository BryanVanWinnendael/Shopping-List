import { useCallback, useRef, useState } from "react"

import { Product } from "@/types/list"
import { modelClient } from "@/lib/model"
import { updateCategory as updateFirebaseCategory } from "@/lib/firebase"
import { Category } from "@/types/generated/models/category"
import { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"

export function useCategories() {
    const bottomSheetRef = useRef<BottomSheetRef>(null)

    const [training, setTraining] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const open = useCallback((product: Product) => {
        setSelectedProduct(product)
        bottomSheetRef.current?.expand()
    }, [])

    const close = useCallback(() => {
        setSelectedProduct(null)
        bottomSheetRef.current?.close()
    }, [])

    const trainModel = useCallback(async () => {
        setTraining(true)

        try {
            await modelClient.trainModel()
        } finally {
            setTraining(false)
        }
    }, [])

    const updateCategory = useCallback(
        async (category: Category) => {
            if (!selectedProduct) return

            await updateFirebaseCategory(selectedProduct, category)
            close()
        },
        [selectedProduct, close]
    )

    return {
        states: {
            training,
        },
        actions: {
            trainModel,
            updateCategory,
            open,
            close,
        },
        refs: {
            bottomSheetRef,
        },
    }
}
