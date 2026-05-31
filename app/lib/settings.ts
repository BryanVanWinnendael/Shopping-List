import AsyncStorage from "@react-native-async-storage/async-storage"
import {AColorUse} from "@/types"
import {DEFAULT_ACOLORUSE} from "@/lib/theme"

const NEW_UI_KEY = "app_newUI"
const FONT_SIZE_KEY = "app_fontSize"
const ACOLOR_KEY = "app_acolor"
const ACOLORUSE_KEY = "app_acoloruse"

export const getFontSize = async () => {
    return await AsyncStorage.getItem(FONT_SIZE_KEY)
}

export const setFontSize = async (size: number) => {
    await AsyncStorage.setItem(FONT_SIZE_KEY, size.toString())
}

export const setNewUI = async (bool: boolean) => {
    await AsyncStorage.setItem(NEW_UI_KEY, bool.toString())
}

export const getNewUI = async () => {
    const storedNewUI = await AsyncStorage.getItem(NEW_UI_KEY)
    return storedNewUI === "true"
}

export const getAColor = async () => {
    return await AsyncStorage.getItem(ACOLOR_KEY)
}

export const setAColor = async (color: string) => {
    await AsyncStorage.setItem(ACOLOR_KEY, color)
}

export const getAColorUse = async () => {
    const storedAColorUse = await AsyncStorage.getItem(ACOLORUSE_KEY)
    if (!storedAColorUse) return DEFAULT_ACOLORUSE
    return JSON.parse(storedAColorUse)
}

export const setAColorUse = async (aColorUse: AColorUse) => {
    await AsyncStorage.setItem(ACOLORUSE_KEY, JSON.stringify(aColorUse))
}
