import uuid from "react-native-uuid"
import {
    createProduct as createFirebaseProduct,
    deleteProduct as deleteFirebaseProduct,
    getProducts as getFirebaseProducts,
} from "@/lib/firebase"
import {useSettingsStore} from "@/stores/useSettingsStore"
import {Product} from "@/types/list"
import * as ImagePicker from "expo-image-picker"
import {storageClient} from "@/lib/storage"
import {useEffect, useState} from "react"
import {useProductsListStore} from "@/stores/useProductsListStore"
import {useNotifications} from "@/hooks/notifications/useNotifications"
import {Category} from "@/types/category-model"

export function useProductsList() {
    const { actions } = useNotifications()
    const { user } = useSettingsStore()
    const { products, setProducts } = useProductsListStore()

    const [loading, setLoading] = useState<boolean>(false)

    const createText = async (product?: string | null, category?: Category | null) => {
        if (!user || !product) return

        const clean = product.trim().replace(/\.$/, "")

        return {
            id: uuid.v4(),
            name: clean,
            type: "text",
            user: user,
            date: Date.now(),
            category: category ?? "remaining",
        } as Product
    }

    const createImage = async (
        product?: string | null,
        url?: string | null,
        image?: ImagePicker.ImagePickerAsset | null
    ) => {
        if (!user) return

        const id = uuid.v4()
        let clean = ""
        let uploadUrl

        if (product) {
            clean = product.trim().replace(/\.$/, "")
        }

        if (image) {
            const response = await storageClient.uploadListImage(image, id)
            if (response?.large) {
                uploadUrl = response?.large
            }
        }

        return {
            id,
            name: clean,
            type: "image",
            user: user,
            date: Date.now(),
            url: uploadUrl ?? url,
            category: "remaining",
        } as Product
    }

    const createProduct = async (
        product?: string | null,
        url?: string | null,
        image?: ImagePicker.ImagePickerAsset | null,
        category?: Category | null
    ) => {
        setLoading(true)

        let newProduct
        if (url || image) {
            newProduct = await createImage(product, url, image)
        } else {
            newProduct = await createText(product, category)
        }

        if (newProduct) {
            await createFirebaseProduct(newProduct)
            actions.pushNotification("added")
        }

        setLoading(false)
    }

    const deleteProduct = async (product: Product) => {
        await deleteFirebaseProduct(product)
        actions.pushNotification("removed")
    }

    useEffect(() => {
        if (!products) getFirebaseProducts(setProducts)
    }, [setProducts])

    return {
        actions: {
            createProduct,
            deleteProduct,
        },
        states: {
            loading,
            products,
        },
    }
}
