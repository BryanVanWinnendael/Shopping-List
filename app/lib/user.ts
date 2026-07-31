import AsyncStorage from "@react-native-async-storage/async-storage"
import { User, UserColorSettings } from "@/types"

const USER_KEY = "app_user"
const USER_COLORS_KEY = "app_user_colors"

export const DEFAULT_USER_COLORS: UserColorSettings = {
    enabled: false,
    colors: {},
}

export const getUser = async (): Promise<User> => {
    const storedUser = await AsyncStorage.getItem(USER_KEY)
    if (!storedUser) return "None"
    return storedUser
}

export const setUser = async (user: string) => {
    await AsyncStorage.setItem(USER_KEY, user)
}

export const getUserColors = async () => {
    const storedUserColors = await AsyncStorage.getItem(USER_COLORS_KEY)
    if (!storedUserColors) return DEFAULT_USER_COLORS
    return JSON.parse(storedUserColors)
}

export const setUserColors = async (userColors: UserColorSettings) => {
    await AsyncStorage.setItem(USER_COLORS_KEY, JSON.stringify(userColors))
}
