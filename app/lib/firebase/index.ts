import Constants from "expo-constants"
import { Categories, Items, ItemType } from "@/types"
import { dev } from "./dev"
import { CATEGORY_ORDER, IS_DEV } from "../constants"

// Loads only the ios native code when non dev env is loaded
const getModule = async () => {
  if (IS_DEV) {
    return dev
  } else {
    const native = await import("./native")
    return native.native
  }
}

export const addItem = async (item: ItemType) => {
  const module = await getModule()
  await module.addItem(item)
}

export const addTestItem = async (item: ItemType) => {
  await dev.addTestItem(item)
}

export const getItems = async (setItems: (items: Items) => any) => {
  const module = await getModule()
  module.getItems(setItems)
}

export const deleteItem = async (item: ItemType) => {
  const module = await getModule()
  await module.deleteItem(item)
}

export const updateCategory = async (item: ItemType, category: Categories) => {
  const module = await getModule()
  await module.updateCategory(item, category)
}

export const editItem = async (item: ItemType) => {
  const module = await getModule()
  return await module.editItem(item)
}

// Sorts the given list of items based on predefined category order
export const CATEGORY_PRIORITY: { [key in Categories]: number } =
  CATEGORY_ORDER.reduce(
    (acc, category, index) => {
      acc[category] = index
      return acc
    },
    {} as { [key in Categories]: number },
  )

export const sortItemsByCategory = (items: Items): Items => {
  if (!items) return {}
  const itemsArray = Object.entries(items)

  itemsArray.sort((a, b) => {
    const priorityA = CATEGORY_PRIORITY[a[1].category]
    const priorityB = CATEGORY_PRIORITY[b[1].category]
    return priorityA - priorityB
  })

  return Object.fromEntries(itemsArray)
}
