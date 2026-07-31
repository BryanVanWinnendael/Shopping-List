import { User } from "@/types/index"
import { Category } from "@/types/generated/models/category"

export interface Product {
    name: string
    type: "text" | "image"
    user: User
    date: number
    url?: string | null
    id: string
    category: Category
}

export interface Products {
    [key: string]: Product
}
