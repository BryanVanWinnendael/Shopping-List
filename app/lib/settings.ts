import AsyncStorage from "@react-native-async-storage/async-storage"
import { Notifications } from "@/types"
import { getUserNotifications } from "./notifications"
import { getUser } from "./user"

const MENU_ICON_KEY = "app_menuIcon"
const NOTIFICATIONS_KEY = "app_notifications"
const NEW_UI_KEY = "app_newUI"
const FONT_SIZE_KEY = "app_fontSize"

export const getFontSize = async () => {
  const storedFontSize = await AsyncStorage.getItem(FONT_SIZE_KEY)
  return storedFontSize
}

export const setFontSize = async (size: number) => {
  await AsyncStorage.setItem(FONT_SIZE_KEY, size.toString())
}

export const getMenuIcon = async () => {
  const storedMenuIcon = await AsyncStorage.getItem(MENU_ICON_KEY)
  return storedMenuIcon === "true"
}

export const setMenuIcon = async (bool: boolean) => {
  await AsyncStorage.setItem(MENU_ICON_KEY, bool.toString())
}

export const setNotifications = async (notifications: Notifications) => {
  await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

export const getNotifications = async (): Promise<Notifications> => {
  const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY)
  if (!storedNotifications) {
    const user = await getUser()
    let notifications: Notifications = {
      added: false,
      removed: false,
      timed: false,
      expoToken: null,
    }
    if (user && user !== "None") {
      const userNotifications = await getUserNotifications(user)
      if (userNotifications.length > 0) {
        for (const notif of userNotifications) {
          if (notif.type === "added") notifications.added = true
          if (notif.type === "removed") notifications.removed = true
          if (notif.type === "timed") notifications.timed = true
        }

        notifications.expoToken = userNotifications[0].token
      }
    }

    return notifications
  }

  return JSON.parse(storedNotifications) as Notifications
}

export const setNewUI = async (bool: boolean) => {
  await AsyncStorage.setItem(NEW_UI_KEY, bool.toString())
}

export const getNewUI = async () => {
  const storedNewUI = await AsyncStorage.getItem(NEW_UI_KEY)
  return storedNewUI === "true"
}
