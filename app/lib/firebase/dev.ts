import { db } from "@/config/firebase"
import { onValue, ref, set } from "firebase/database"
import { categoryClient } from "../category"
import { storageClient } from "@/lib/storage"
import { sortProductsByCategory } from "."
import { Product, Products } from "@/types/list"
import { Category, CreateCategoryRequest } from "@/types/category-model"
import { DeleteImageRequest } from "@/types/storage"

const createProduct = async (product: Product) => {
    try {
        if (product.type == "text" && product.category === "remaining") {
            const response = await categoryClient.getCategory(product.name)
            if (response) {
                product.category = response.category
            }
        }
        await set(ref(db, "products/" + product.id), product)
    } catch (error) {
        console.error("Error creating product: ", error)
    }
}

const createTestProduct = async (product: Product) => {
    try {
        await set(ref(db, "products/" + product.id), product)
    } catch (error) {
        console.error("Error creating product: ", error)
    }
}

const getProducts = async (setProducts: (products: Products) => any) => {
    try {
        const productsRef = ref(db, "products")
        onValue(productsRef, (snapshot) => {
            const data: Products = snapshot.val()
            const sortedData = sortProductsByCategory(data)
            setProducts(sortedData)
        })
    } catch (error) {
        console.error("Error getting products: ", error)
    }
}

const deleteProduct = async (product: Product) => {
    try {
        const productRef = ref(db, "products/" + product.id)
        await set(productRef, null)
        if (product.type === "image" && product.url) {
            const request: DeleteImageRequest = {
                url: product.url,
            }
            await storageClient.deleteListImage(product.id, request)
        }
    } catch (error) {
        console.error("Error deleting product: ", error)
    }
}

const updateCategory = async (product: Product, category: Category) => {
    try {
        const updatedProduct: Product = {
            ...product,
            category,
        }
        await set(ref(db, "products/" + product.id), updatedProduct)
        const request: CreateCategoryRequest = {
            product: product.name,
            category: category,
        }
        await categoryClient.createCategory(request)
    } catch (error) {
        console.error("Error updating categories: ", error)
    }
}

const updateProduct = async (product: Product) => {
    try {
        await set(ref(db, "products/" + product.id), product)
    } catch (error) {
        console.error("Error updating product: ", error)
    }
}

export const dev = {
    getProducts,
    createProduct,
    createTestProduct,
    deleteProduct,
    updateCategory,
    updateProduct,
}
