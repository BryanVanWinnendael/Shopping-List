import {
  Notification,
  NotificationResponse,
  NotificationTypes,
  Users,
} from "@/types"
import { httpRequest } from "./httpHelper"
import { IS_DEV } from "./constants"

const NOTIFICATIONS_PATH = "notifications"

export const addNotification = async (
  notification: Notification,
): Promise<boolean> => {
  try {
    await httpRequest<void>({
      url: NOTIFICATIONS_PATH,
      method: "POST",
      body: notification,
    })

    return true
  } catch (error) {
    console.error("Error adding notification:", error)
    return false
  }
}

export const deleteNotification = async (
  user: Users,
  type: string,
): Promise<boolean> => {
  try {
    await httpRequest<void>({
      url: `${NOTIFICATIONS_PATH}/${user}/${type}`,
      method: "DELETE",
    })

    return true
  } catch (error) {
    console.error("Error deleting notification:", error)
    return false
  }
}

export const sendNotification = async (
  type: NotificationTypes,
  user: Users,
): Promise<boolean> => {
  try {
    await httpRequest<void>({
      url: `${NOTIFICATIONS_PATH}/push/${type}/${user}`,
      method: "POST",
      body: {
        env: IS_DEV ? "dev" : "prod",
      },
    })

    return true
  } catch (error) {
    console.error("Error sending notification:", error)
    return false
  }
}

export const getUserNotifications = async (
  user: string,
): Promise<NotificationResponse[]> => {
  try {
    const response = await httpRequest<NotificationResponse[]>({
      url: `${NOTIFICATIONS_PATH}/users/${user}`,
      method: "GET",
    })

    return response.data
  } catch (error) {
    console.error("Error deleting notification:", error)
    return []
  }
}
