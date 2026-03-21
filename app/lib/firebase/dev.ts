import { db } from "@/config/firebase"
import type { Categories, ItemType, Items } from "@/types"
import { onValue, ref, set } from "firebase/database"
import { addCategory, getCategory } from "../categories"
import { deleteListImage } from "../storage"
import { sortItemsByCategory } from "."

const addItem = async (item: ItemType) => {
  try {
    if (item.type == "text" && item.category === "remaining") {
      const category = await getCategory(item.item)
      item.category = category
    }
    await set(ref(db, "items/" + item.id), item)
  } catch (error) {
    console.error("Error adding item: ", error)
  }
}

const addTestItem = async (item: ItemType) => {
  try {
    await set(ref(db, "items/" + item.id), item)
  } catch (error) {
    console.error("Error adding item: ", error)
  }
}

const getItems = async (setItems: (items: Items) => any) => {
  try {
    const itemsRef = ref(db, "items")
    onValue(itemsRef, (snapshot) => {
      const data: Items = snapshot.val()
      const sortedData = sortItemsByCategory(data)
      setItems(sortedData)
    })
  } catch (error) {
    console.error("Error getting items: ", error)
  }
}

const deleteItem = async (item: ItemType) => {
  try {
    const itemRef = ref(db, "items/" + item.id)
    set(itemRef, null)
    if (item.type === "image" && item.url)
      await deleteListImage(item.id, item.url)
  } catch (error) {
    console.error("Error deleting item: ", error)
  }
}

const updateCategory = async (item: ItemType, category: Categories) => {
  try {
    const updatedItem: ItemType = {
      ...item,
      category,
    }
    await set(ref(db, "items/" + item.id), updatedItem)
    addCategory(category, item.item)
  } catch (error) {
    console.error("Error updating category: ", error)
  }
}

const editItem = async (item: ItemType) => {
  try {
    await set(ref(db, "items/" + item.id), item)
  } catch (error) {
    console.error("Error editing item: ", error)
  }
}

export const dev = {
  getItems,
  addItem,
  addTestItem,
  deleteItem,
  updateCategory,
  editItem,
}
