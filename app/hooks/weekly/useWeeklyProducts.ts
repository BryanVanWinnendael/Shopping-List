import { useCallback, useEffect, useState } from "react"
import { categoryClient } from "@/lib/category"
import { cronClient } from "@/lib/cron"
import { CronProduct } from "@/types/cron"
import { useWeeklyStore } from "@/stores/useWeeklyStore"
import { useSettingsStore } from "@/stores/useSettingsStore"

export function useWeeklyProducts() {
    const { user } = useSettingsStore()
    const { setCronProducts, cronProducts } = useWeeklyStore()

    const [product, setProduct] = useState("")
    const [loading, setLoading] = useState(false)

    const getCronProducts = useCallback(async () => {
        if (!user) return
        setLoading(true)

        const response = await cronClient.getCronProductsByUser(user)
        if (response) {
            setCronProducts(response)
        }

        setLoading(false)
    }, [])

    const createCronProduct = async () => {
        if (!product.trim() || !user) return
        setLoading(true)

        let trimmed = product.trim()
        if (trimmed.endsWith(".")) {
            trimmed = trimmed.slice(0, -1)
        }

        const responseCategory = await categoryClient.getCategory(trimmed)
        if (!responseCategory) {
            setLoading(false)
            return
        }

        const newCronProduct: CronProduct = {
            product: trimmed,
            user,
            category: responseCategory.category,
        }

        const responseCron = await cronClient.createCronProduct(newCronProduct)
        if (responseCron) {
            setCronProducts([...cronProducts, responseCron])
        }

        setProduct("")
        setLoading(false)
    }

    const deleteCronProduct = async (id?: string | null) => {
        if (!id) return
        setLoading(true)

        const response = await cronClient.deleteCronProduct(id)
        if (response) {
            setCronProducts(cronProducts.filter((cronProduct) => cronProduct.id !== response.id))
        }

        setLoading(false)
    }

    const updateCronProduct = async (cronProduct: CronProduct) => {
        const id = cronProduct?.id
        if (!id) return
        setLoading(true)

        const updated = cronProducts.map((item) => (item.id === id ? { ...item, ...cronProduct } : item))

        setCronProducts(updated)

        setLoading(false)
    }

    useEffect(() => {
        if (cronProducts.length === 0) getCronProducts()
    }, [])

    return {
        states: {
            product,
            cronProducts,
            loading,
        },
        actions: {
            setProduct,
            getCronProducts,
            createCronProduct,
            deleteCronProduct,
            updateCronProduct,
        },
    }
}
