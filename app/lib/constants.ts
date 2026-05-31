import { ADMIN_USERS, USERS } from "@env"
import Constants from "expo-constants"
import { Category } from "@/types/category-model"
import { Country, MealType } from "@/types/recipes"
import { Theme, User } from "@/types"
import { Action } from "@/types/logs"

export const CATEGORY_ORDER: Category[] = [
    "remaining",
    "bread",
    "housekeeping",
    "drinks",
    "meat",
    "fish",
    "fruit/vegetables",
    "fridge",
    "dairy",
    "world",
    "breakfast",
    "snacks",
    "carbs",
    "sugar/desserts",
    "sauce/spices",
    "preserved",
    "hygiene",
    "freezer",
]

export const MEAL_TYPES: MealType[] = ["Any", "Breakfast", "Lunch", "Dinner", "Dessert"]

export const MEALS: { [key in MealType]: string } = {
    Any: "🍽",
    Breakfast: "🥞",
    Lunch: "🥪",
    Dinner: "🍝",
    Dessert: "🍰",
}

export const GRADIENT = ["#4E64D4", "#D0ACCA", "#F2B297"] as const

export const COUNTRIES: Country[] = [
    { name: "Argentina", flag: "🇦🇷" },
    { name: "Australia", flag: "🇦🇺" },
    { name: "Austria", flag: "🇦🇹" },
    { name: "Belgium", flag: "🇧🇪" },
    { name: "Brazil", flag: "🇧🇷" },
    { name: "Canada", flag: "🇨🇦" },
    { name: "Chile", flag: "🇨🇱" },
    { name: "China", flag: "🇨🇳" },
    { name: "Czech Republic", flag: "🇨🇿" },
    { name: "Denmark", flag: "🇩🇰" },
    { name: "Egypt", flag: "🇪🇬" },
    { name: "Finland", flag: "🇫🇮" },
    { name: "France", flag: "🇫🇷" },
    { name: "Germany", flag: "🇩🇪" },
    { name: "Greece", flag: "🇬🇷" },
    { name: "India", flag: "🇮🇳" },
    { name: "Indonesia", flag: "🇮🇩" },
    { name: "Ireland", flag: "🇮🇪" },
    { name: "Italy", flag: "🇮🇹" },
    { name: "Japan", flag: "🇯🇵" },
    { name: "Kenya", flag: "🇰🇪" },
    { name: "Malaysia", flag: "🇲🇾" },
    { name: "Mexico", flag: "🇲🇽" },
    { name: "Morocco", flag: "🇲🇦" },
    { name: "Netherlands", flag: "🇳🇱" },
    { name: "New Zealand", flag: "🇳🇿" },
    { name: "Nigeria", flag: "🇳🇬" },
    { name: "Norway", flag: "🇳🇴" },
    { name: "Peru", flag: "🇵🇪" },
    { name: "Philippines", flag: "🇵🇭" },
    { name: "Poland", flag: "🇵🇱" },
    { name: "Portugal", flag: "🇵🇹" },
    { name: "Saudi Arabia", flag: "🇸🇦" },
    { name: "Singapore", flag: "🇸🇬" },
    { name: "South Africa", flag: "🇿🇦" },
    { name: "South Korea", flag: "🇰🇷" },
    { name: "Spain", flag: "🇪🇸" },
    { name: "Sweden", flag: "🇸🇪" },
    { name: "Switzerland", flag: "🇨🇭" },
    { name: "Thailand", flag: "🇹🇭" },
    { name: "Turkey", flag: "🇹🇷" },
    { name: "United Arab Emirates", flag: "🇦🇪" },
    { name: "United Kingdom", flag: "🇬🇧" },
    { name: "United States", flag: "🇺🇸" },
    { name: "Vietnam", flag: "🇻🇳" },
    { name: "Lebanon", flag: "🇱🇧" },
    { name: "Ethiopia", flag: "🇪🇹" },
]

export const USERS_ARRAY = JSON.parse(USERS) as User[]

export const ADMIN_USERS_ARRAY = JSON.parse(ADMIN_USERS) as User[]

export const IS_DEV = Constants.appOwnership === "expo"

export const ACTION_COLORS: Record<Action, string> = {
    create: "#3B82F6",
    delete: "#EF4444",
    get: "#22C55E",
    update: "#F59E0B",
}

export const THEMES: { key: Theme; label: string }[] = [
    { key: "light", label: "Light" },
    { key: "dark", label: "Dark" },
    { key: "true dark", label: "True Dark" },
]

export const DEFAULT_FONT_SIZE = 35
export const MIN_FONT_SIZE = 30
export const MAX_FONT_SIZE = 80
