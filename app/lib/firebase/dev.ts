import { db } from "@/config/firebase"
import { onValue, ref, set } from "firebase/database"
import { categoryClient } from "../category"
import { storageClient } from "@/lib/storage"
import { sortProductsByCategory } from "."
import { Product, Products } from "@/types/list"
import { CreateCategoryRequest } from "@/types/generated/contracts/category-model"
import { Category } from "@/types/generated/models/category"
import { DeleteImageRequest } from "@/types/generated/contracts/storage"
import { logsClient } from "@/lib/logs"

const createProduct = async (product: Product) => {
    try {
        if (product.type == "text" && product.category === "remaining") {
            const response = await categoryClient.getCategory(product.name)
            if (response) {
                product.category = response.category
            }
        }
        await set(ref(db, "products/" + product.id), product)

        const msg = `${JSON.stringify(product)} added to list by ${product.user}`
        await logsClient.createLog(msg, "POST")
    } catch (error) {
        console.error("Error creating product: ", error)
        const msg = `Error: ${JSON.stringify(product)} added to list by ${product.user} ${error}`
        await logsClient.createLog(msg, "POST", true)
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

            const msg = "Get product list"
            logsClient.createLog(msg, "GET")
        })
    } catch (error) {
        console.error("Error getting products: ", error)
        const msg = `Error: get product list ${error}`
        logsClient.createLog(msg, "GET", true)
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

        const msg = `${JSON.stringify(product)} deleted`
        await logsClient.createLog(msg, "DELETE")
    } catch (error) {
        console.error("Error deleting product: ", error)
        const msg = `Error: deleted ${JSON.stringify(product)} ${error}`
        await logsClient.createLog(msg, "DELETE", true)
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

        const msg = `Update category for ${JSON.stringify(product)}`
        await logsClient.createLog(msg, "PUT")
    } catch (error) {
        console.error("Error updating categories: ", error)
        const msg = `Error: update category for ${JSON.stringify(product)} ${error}`
        await logsClient.createLog(msg, "PUT", true)
    }
}

const updateProduct = async (product: Product) => {
    try {
        await set(ref(db, "products/" + product.id), product)

        const msg = `Update product for ${JSON.stringify(product)}`
        await logsClient.createLog(msg, "PUT")
    } catch (error) {
        console.error("Error updating product: ", error)
        const msg = `Error: update product for ${JSON.stringify(product)} ${error}`
        await logsClient.createLog(msg, "PUT", true)
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
