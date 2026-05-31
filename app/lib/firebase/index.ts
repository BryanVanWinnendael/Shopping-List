import { dev } from "./dev"
import { CATEGORY_ORDER, IS_DEV } from "../constants"
import { Category } from "@/types/category-model"
import { Product, Products } from "@/types/list"

// Loads only the ios native code when non dev env is loaded
const getModule = async () => {
    if (IS_DEV) {
        return dev
    } else {
        const native = await import("./native")
        return native.native
    }
}

export const createProduct = async (product: Product) => {
    const module = await getModule()
    await module.createProduct(product)
}

export const createTestProduct = async (product: Product) => {
    await dev.createTestProduct(product)
}

export const getProducts = async (setProducts: (products: Products) => any) => {
    const module = await getModule()
    await module.getProducts(setProducts)
}

export const deleteProduct = async (product: Product) => {
    const module = await getModule()
    await module.deleteProduct(product)
}

export const updateCategory = async (product: Product, category: Category) => {
    const module = await getModule()
    await module.updateCategory(product, category)
}

export const updateProduct = async (product: Product) => {
    const module = await getModule()
    return await module.updateProduct(product)
}

// Sorts the given products-list of products based on predefined categories order
export const CATEGORY_PRIORITY: { [key in Category]: number } = CATEGORY_ORDER.reduce(
    (acc, category, index) => {
        acc[category] = index
        return acc
    },
    {} as { [key in Category]: number }
)

export const sortProductsByCategory = (products: Products): Products => {
    if (!products) return {}
    const productsArray = Object.entries(products)

    productsArray.sort((a, b) => {
        const priorityA = CATEGORY_PRIORITY[a[1].category]
        const priorityB = CATEGORY_PRIORITY[b[1].category]
        return priorityA - priorityB
    })

    return Object.fromEntries(productsArray)
}
