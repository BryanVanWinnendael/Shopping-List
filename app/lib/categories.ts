import { Categories } from "@/types"
import { httpRequest } from "./httpHelper"

const CATEGORIES_PATH = "category-model/category"

export const getCategory = async (text: string): Promise<Categories> => {
  try {
    const response = await httpRequest<{ category: Categories }>({
      url: CATEGORIES_PATH,
      method: "GET",
      params: { item: text },
    })

    return response.data.category
  } catch (error) {
    console.error("Error fetching category:", error)
    return "remaining"
  }
}

export const addCategory = async (
  category: Categories,
  item: string,
): Promise<boolean> => {
  try {
    await httpRequest<void>({
      url: CATEGORIES_PATH,
      method: "POST",
      body: { item, category },
    })

    return true
  } catch (error) {
    console.error("Error adding category:", error)
    return false
  }
}
