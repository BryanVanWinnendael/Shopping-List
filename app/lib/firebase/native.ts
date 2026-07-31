import database from "@react-native-firebase/database"
import { logsClient } from "../logs"
import { categoryClient } from "../category"
import { storageClient } from "../storage"
import { sortProductsByCategory } from "."
import auth from "@react-native-firebase/auth"
import { Product, Products } from "@/types/list"
import { Category } from "@/types/generated/models/category"
import { CreateCategoryRequest } from "@/types/generated/contracts/category-model"
import { DeleteImageRequest } from "@/types/generated/contracts/storage"

const ensureAuth = async () => {
    if (!auth().currentUser) {
        try {
            await auth().signInAnonymously()
        } catch (error) {
            const msg = `Authentication error: ${error}`
            await logsClient.createLog(msg, "GET", true)
        }
    }
}

const createProduct = async (product: Product) => {
    try {
        await ensureAuth()

        if (product.type === "text" && product.category === "remaining") {
            const response = await categoryClient.getCategory(product.name)
            if (response) {
                product.category = response.category
            }
        }

        await database().ref(`products/${product.id}`).set(product)

        const msg = `${JSON.stringify(product)} added to list by ${product.user}`
        await logsClient.createLog(msg, "POST")
    } catch (error) {
        const msg = `Error: ${JSON.stringify(product)} added to list by ${product.user} ${error}`
        await logsClient.createLog(msg, "POST", true)
    }
}

const getProducts = async (setProducts: (products: Products) => any) => {
    await ensureAuth()

    const productsRef = database().ref("products")
    productsRef.on(
        "value",
        (snapshot) => {
            const data: Products = snapshot.val()
            setProducts(sortProductsByCategory(data))

            const msg = "Get product list"
            logsClient.createLog(msg, "GET")
        },
        (error) => {
            const msg = `Error: get product list ${error.message}`
            logsClient.createLog(msg, "GET", true)
        }
    )
}

const deleteProduct = async (product: Product) => {
    try {
        await ensureAuth()

        await database().ref(`products/${product.id}`).remove()

        if (product.type === "image" && product.url) {
            const request: DeleteImageRequest = {
                url: product.url,
            }
            await storageClient.deleteListImage(product.id, request)
        }

        const msg = `${JSON.stringify(product)} deleted`
        await logsClient.createLog(msg, "DELETE")
    } catch (error) {
        const msg = `Error: deleted ${JSON.stringify(product)} ${error}`
        await logsClient.createLog(msg, "DELETE", true)
    }
}

const updateCategory = async (product: Product, category: Category) => {
    try {
        await ensureAuth()

        product.category = category

        await database().ref(`products/${product.id}`).set(product)
        const request: CreateCategoryRequest = {
            category,
            product: product.name,
        }
        await categoryClient.createCategory(request)

        const msg = `Update category for ${JSON.stringify(product)}`
        await logsClient.createLog(msg, "PUT")
    } catch (error) {
        const msg = `Error: update category for ${JSON.stringify(product)} ${error}`
        await logsClient.createLog(msg, "PUT", true)
    }
}

const updateProduct = async (product: Product) => {
    try {
        await ensureAuth()

        await database().ref(`products/${product.id}`).set(product)

        const msg = `Update product for ${JSON.stringify(product)}`
        await logsClient.createLog(msg, "PUT")
    } catch (error) {
        const msg = `Error: update product for ${JSON.stringify(product)} ${error}`
        await logsClient.createLog(msg, "PUT", true)
    }
}

export const native = {
    getProducts,
    createProduct,
    deleteProduct,
    updateCategory,
    updateProduct,
}
