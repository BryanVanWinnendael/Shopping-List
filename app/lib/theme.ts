import AsyncStorage from "@react-native-async-storage/async-storage"
import { Theme } from "@/types"

const THEME_KEY = "app_theme"

export const DEFAULT_ACOLOR = "#1e55fc"
export const DEFAULT_ACOLORUSE = {
    header: false,
}

export const getTheme = async () => {
    return await AsyncStorage.getItem(THEME_KEY)
}

export const setTheme = async (theme: Theme) => {
    await AsyncStorage.setItem(THEME_KEY, theme)
}

export const BORDER_RADIUS_S = 12

export const BORDER_RADIUS_M = 16

export const BORDER_RADIUS_L = 24

export const BORDER_RADIUS_FULL = 999
