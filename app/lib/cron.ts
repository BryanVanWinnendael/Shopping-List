import { Categories, CronType, Users } from "@/types"
import { httpRequest } from "./httpHelper"

const CRON_PATH = "cron"

export const getCronItemsByUser = async (user: Users): Promise<CronType[]> => {
  try {
    const response = await httpRequest<CronType[]>({
      url: `${CRON_PATH}/users/${user}`,
      method: "GET",
    })

    return response.data
  } catch (error) {
    console.error("Error fetching cron items by user:", error)
    return []
  }
}

export const getCronItems = async (): Promise<CronType[]> => {
  try {
    const response = await httpRequest<CronType[]>({
      url: CRON_PATH,
      method: "GET",
    })

    return response.data
  } catch (error) {
    console.error("Error fetching cron items:", error)
    return []
  }
}

export const addCronItem = async (cronItem: CronType): Promise<boolean> => {
  try {
    await httpRequest<void, CronType>({
      url: CRON_PATH,
      method: "POST",
      body: cronItem,
    })

    return true
  } catch (error) {
    console.error("Error adding cron item:", error)
    return false
  }
}

export const deleteCronItem = async (id: string): Promise<boolean> => {
  try {
    await httpRequest<void>({
      url: `${CRON_PATH}/${id}`,
      method: "DELETE",
    })

    return true
  } catch (error) {
    console.error("Error deleting cron item:", error)
    return false
  }
}

export const updateCronItemCategory = async (
  id: string,
  category: Categories,
): Promise<boolean> => {
  try {
    await httpRequest<void, { category: Categories }>({
      url: `${CRON_PATH}/${id}`,
      method: "PUT",
      body: { category },
    })

    return true
  } catch (error) {
    console.error("Error updating cron item category:", error)
    return false
  }
}
