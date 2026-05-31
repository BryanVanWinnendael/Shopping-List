import AsyncStorage from "@react-native-async-storage/async-storage"
import { Theme } from "@/types"

const THEME_KEY = "app_theme"

export const DEFAULT_ACOLOR = "#4E64D4"
export const DEFAULT_ACOLORUSE = {
    image: false,
    input: false,
    header: false,
}

export const getTheme = async () => {
    return await AsyncStorage.getItem(THEME_KEY)
}

export const setTheme = async (theme: Theme) => {
    await AsyncStorage.setItem(THEME_KEY, theme)
}
