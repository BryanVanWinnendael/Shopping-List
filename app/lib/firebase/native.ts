import database from "@react-native-firebase/database"
import type { Categories, ItemType, Items } from "@/types"
import { createLogs } from "../logs"
import { addCategory, getCategory } from "../categories"
import { deleteListImage } from "../storage"
import { sortItemsByCategory } from "."
import auth from "@react-native-firebase/auth"

const ensureAuth = async () => {
  if (!auth().currentUser) {
    await auth().signInAnonymously()
  }
}

const addItem = async (item: ItemType) => {
  try {
    await ensureAuth()

    if (item.type === "text" && item.category === "remaining") {
      const category = await getCategory(item.item)
      item.category = category
    }

    await database().ref(`items/${item.id}`).set(item)
    createLogs("add", item.item)
  } catch (error) {
    const msg = `${error} for ${item.item}`
    createLogs("add", msg, true)
  }
}

const getItems = async (setItems: (items: Items) => any) => {
  await ensureAuth()

  const itemsRef = database().ref("items")
  itemsRef.on(
    "value",
    (snapshot) => {
      const data: Items = snapshot.val()
      setItems(sortItemsByCategory(data))
      createLogs("get", "all items")
    },
    (error) => {
      const msg = `${error.message}`
      createLogs("get", msg, true)
    },
  )
}

const deleteItem = async (item: ItemType) => {
  try {
    await ensureAuth()

    await database().ref(`items/${item.id}`).remove()

    if (item.type === "image" && item.url)
      await deleteListImage(item.id, item.url)

    createLogs("delete", item.item)
  } catch (error) {
    const msg = `${item.item}: ${error}`
    createLogs("delete", msg, true)
  }
}

const updateCategory = async (item: ItemType, category: Categories) => {
  try {
    await ensureAuth()

    item.category = category

    await database().ref(`items/${item.id}`).set(item)
    addCategory(category, item.item)

    const msg = `update category for ${item.item}`
    createLogs("update", msg)
  } catch (error) {
    const msg = `update category: ${error} for ${item.item}`
    createLogs("update", msg, true)
  }
}

const editItem = async (item: ItemType) => {
  try {
    await ensureAuth()

    await database().ref(`items/${item.id}`).set(item)
    createLogs("update", item.item)
  } catch (error) {
    const msg = `${error} for ${item.item}`
    createLogs("update", msg, true)
  }
}

export const native = {
  getItems,
  addItem,
  deleteItem,
  updateCategory,
  editItem,
}
