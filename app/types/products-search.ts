import { Category } from "@/types/category-model"

export type Product = {
    pid: string
    name: string
    brand: string
    category: Category
    image: string
}

export type ProductsSearchResponse = {
    products: Product[]
    dateUpdated: string
    total: number
    page: number
    pageSize: number
    totalPages: number
    product: string
    category: Category
}
