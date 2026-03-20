import AsyncStorage from "@react-native-async-storage/async-storage"
import { UserColorSettings } from "@/types"

const USER_KEY = "app_user"
const USERCOLORS_KEY = "app_usercolors"

export const DEFAULT_USERCOLORS: UserColorSettings = {
  enabled: false,
  colors: {},
}

export const getUser = async () => {
  const storedUser = await AsyncStorage.getItem(USER_KEY)
  if (!storedUser) return "None"
  return storedUser
}

export const setUser = async (user: string) => {
  await AsyncStorage.setItem(USER_KEY, user)
}

export const getUserColors = async () => {
  const storedUserColors = await AsyncStorage.getItem(USERCOLORS_KEY)
  if (!storedUserColors) return DEFAULT_USERCOLORS
  return JSON.parse(storedUserColors)
}

export const setUserColors = async (userColors: UserColorSettings) => {
  await AsyncStorage.setItem(USERCOLORS_KEY, JSON.stringify(userColors))
}
