import { useState } from "react"
import { updateProduct as updateFirebaseProduct } from "@/lib/firebase"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { Product } from "@/types/list"

export function useUpdateProduct() {
    const { user } = useSettingsStore()

    const [name, setName] = useState("")
    const [product, setProduct] = useState<Product | null>(null)

    const reset = () => {
        setName("")
        setProduct(null)
    }

    const updateProductPreview = (name: string) => {
        setName(name)
        setProduct((prev) => {
            if (!prev) return prev
            return {
                ...prev,
                name: name,
            }
        })
    }

    const updateProduct = async () => {
        if (!product || !name.trim() || !user) return reset()

        let trimmedName = name.trim()
        if (trimmedName.endsWith(".")) {
            trimmedName = trimmedName.slice(0, -1)
        }
        if (trimmedName === "") return reset()

        const updated: Product = {
            ...product,
            name: trimmedName,
        }

        await updateFirebaseProduct(updated)
        reset()
    }

    return {
        states: {
            name,
            product,
        },
        actions: {
            setName,
            updateProduct,
            setProduct,
            updateProductPreview,
            reset,
        },
    }
}
