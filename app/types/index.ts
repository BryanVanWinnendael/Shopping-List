import { USERS } from "@env"
import { Category } from "@/types/category-model"

export type User = (typeof USERS)[number] | "None"

export type Theme = "light" | "dark" | "true dark"

export type AColorUse = {
    image: boolean
    input: boolean
    header: boolean
}

type UserColors = Record<string, string>

export type UserColorSettings = {
    enabled: boolean
    colors: UserColors
}

type ThemeVariant = {
    light: string
    dark: string
}

export type CategoriesColors = {
    [key in Category]: ThemeVariant
}

export type GatewayResponse<T> = {
    data: T
}
