import { Category } from "@/types/category-model"
import { User } from "@/types/index"

export type CronProduct = {
    product: string
    user: string
    category: Category
    id?: string | null
}

export type CreateCronProductRequest = {
    category: string
    user: User
    product: string
}

export type CreateCronProductResponse = CronProduct

export type UpdateCronProductCategoryRequest = {
    category: string
}

export type UpdateCronProductCategoryResponse = CronProduct

export type GetAllCronProductsResponse = CronProduct[]

export type GetCronProductsByUserResponse = CronProduct[]

export type DeleteCronProductResponse = {
    id: string
    message: string
}
