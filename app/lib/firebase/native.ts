import database from "@react-native-firebase/database"
import { logsClient } from "../logs"
import { categoryClient } from "../category"
import { storageClient } from "../storage"
import { sortProductsByCategory } from "."
import auth from "@react-native-firebase/auth"
import { Action } from "@/types/logs"
import { Product, Products } from "@/types/list"
import { Category, CreateCategoryRequest } from "@/types/category-model"
import { DeleteImageRequest } from "@/types/storage"

const ensureAuth = async (action: Action) => {
    if (!auth().currentUser) {
        try {
            await auth().signInAnonymously()
        } catch (error) {
            const msg = `Authentication error: ${error}`
            await logsClient.createLog(action, msg, true)
        }
    }
}

const createProduct = async (product: Product) => {
    try {
        await ensureAuth("create")

        if (product.type === "text" && product.category === "remaining") {
            const response = await categoryClient.getCategory(product.name)
            if (response) {
                product.category = response.category
            }
        }

        await database().ref(`products/${product.id}`).set(product)
        await logsClient.createLog("create", product.name)
    } catch (error) {
        const msg = `${error} for ${product.name}`
        await logsClient.createLog("create", msg, true)
    }
}

const getProducts = async (setProducts: (products: Products) => any) => {
    await ensureAuth("get")

    const productsRef = database().ref("products")
    productsRef.on(
        "value",
        (snapshot) => {
            const data: Products = snapshot.val()
            setProducts(sortProductsByCategory(data))
            logsClient.createLog("get", "all products")
        },
        (error) => {
            const msg = `${error.message}`
            logsClient.createLog("get", msg, true)
        }
    )
}

const deleteProduct = async (product: Product) => {
    try {
        await ensureAuth("delete")

        await database().ref(`products/${product.id}`).remove()

        if (product.type === "image" && product.url) {
            const request: DeleteImageRequest = {
                url: product.url,
            }
            await storageClient.deleteListImage(product.id, request)
        }

        await logsClient.createLog("delete", product.name)
    } catch (error) {
        const msg = `${product.name}: ${error}`
        await logsClient.createLog("delete", msg, true)
    }
}

const updateCategory = async (product: Product, category: Category) => {
    try {
        await ensureAuth("update")

        product.category = category

        await database().ref(`products/${product.id}`).set(product)
        const request: CreateCategoryRequest = {
            category,
            product: product.name,
        }
        await categoryClient.createCategory(request)

        const msg = `update category for ${product.name}`
        await logsClient.createLog("update", msg)
    } catch (error) {
        const msg = `update category: ${error} for ${product.name}`
        await logsClient.createLog("update", msg, true)
    }
}

const updateProduct = async (product: Product) => {
    try {
        await ensureAuth("update")

        await database().ref(`products/${product.id}`).set(product)
        await logsClient.createLog("update", product.name)
    } catch (error) {
        const msg = `${error} for ${product.name}`
        await logsClient.createLog("update", msg, true)
    }
}

export const native = {
    getProducts,
    createProduct,
    deleteProduct,
    updateCategory,
    updateProduct,
}
