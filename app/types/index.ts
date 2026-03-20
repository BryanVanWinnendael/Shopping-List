import { USERS } from "@env"
import * as ImagePicker from "expo-image-picker"

export interface ItemType {
  item: string
  type: "text" | "image"
  addedBy: string
  addedAt: number
  url?: string
  id: string
  category: Categories
}

export interface Items {
  [key: string]: ItemType
}

export type Users = (typeof USERS)[number] | "None"

export type Theme = "light" | "dark" | "true dark"

export type Actions = "add" | "delete" | "get" | "update"

export type Categories =
  | "bread"
  | "drinks"
  | "housekeeping"
  | "meat"
  | "fish"
  | "fruit/vegetables"
  | "fridge"
  | "dairy"
  | "world"
  | "breakfast"
  | "snacks"
  | "carbs"
  | "sugar/desserts"
  | "sauce/spices"
  | "preserved"
  | "hygiene"
  | "freezer"
  | "remaining"

export type AColorUse = {
  image: boolean
  input: boolean
}

type UserColors = Record<string, string>

export type UserColorSettings = {
  enabled: boolean
  colors: UserColors
}

export type Recipe = {
  title: string
  id: string
  public: boolean
  image?: string
  color?: string
  list?: {
    url?: string
    item: string
    type: "text" | "image"
    id?: string
  }[]
  source?: string
  notes?: string
  time?: number // in minutes
  country?: string
  meal_type?: MealType
  created_by: Users
}

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Dessert" | "Any"

export type Ingredient = {
  item: string
  type: "text" | "image"
  image?: ImagePicker.ImagePickerAsset // for new images
  url?: string // for existing images from backend
  id?: string // for existing images from backend
}

export type ProductSearch = {
  item: string
  category: Categories
  brand: string
  image: string
}

export type FilterStates = {
  public: boolean
  mealType: MealType
  country: string
  time: number | null
}

export type CronType = {
  item: string
  addedBy: string
  category: Categories
  id?: string
}

export type NotificationTypes = "added" | "timed" | "removed"

export type Notifications = {
  added: boolean
  timed: boolean
  removed: boolean
  expoToken?: string | null
}

export type NotificationResponse = {
  id: string
  user: Users
  type: NotificationTypes
  token: string
}

export type Notification = {
  user: Users
  type: NotificationTypes
  token: string
}

export enum UploadResult {
  Size = "size",
  Error = "error",
}

export type UploadResponse =
  | { ok: true; url: string }
  | { ok: false; reason: UploadResult }

export type UploadRecipeResponse =
  | { ok: true; large: string; small: string }
  | { ok: false; reason: UploadResult }

export type Toasts = UploadResult | (string & {})

export type Country = {
  name: string
  flag: string
}

export type ProductsSearchResult = {
  products: ProductSearch[]
  dateUpdated: string
}

type ThemeVariant = {
  light: string
  dark: string
}

export type CategoriesColors = {
  [key in Categories]: ThemeVariant
}

export type GatewayResponse<T> = {
  data: T
}
