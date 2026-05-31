import { useCallback, useRef, useState } from "react"
import { Product } from "@/types/list"
import BottomSheet from "@gorhom/bottom-sheet"
import { modelClient } from "@/lib/model"
import { Category } from "@/types/category-model"
import { updateCategory as updateFirebaseCategory } from "@/lib/firebase"

export function useCategories() {
    const bottomSheetRef = useRef<BottomSheet>(null)

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

    const trainModel = async () => {
        setTraining(true)
        await modelClient.trainModel()
        setTraining(false)
    }

    const updateCategory = async (category: Category) => {
        if (!selectedProduct) return
        await updateFirebaseCategory(selectedProduct, category)
        close()
    }

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
