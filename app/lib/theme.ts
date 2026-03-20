import AsyncStorage from "@react-native-async-storage/async-storage"
import { AColorUse, Theme } from "@/types"

const THEME_KEY = "app_theme"
const ACOLOR_KEY = "app_acolor"
const ACOLORUSE_KEY = "app_acoloruse"

export const DEFAULT_ACOLOR = "#4E64D4"
export const DEFAULT_ACOLORUSE = {
  image: false,
  input: false,
}

export const getTheme = async () => {
  const storedTheme = await AsyncStorage.getItem(THEME_KEY)
  return storedTheme
}

export const setTheme = async (theme: Theme) => {
  await AsyncStorage.setItem(THEME_KEY, theme)
}

export const getAColor = async () => {
  const storedAColor = await AsyncStorage.getItem(ACOLOR_KEY)
  return storedAColor
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

export const getBackgroundColor = (theme: Theme): string => {
  switch (theme) {
    case "dark":
      return "#080808"
    case "true dark":
      return "#000000"
    default:
      return "white"
  }
}

export const getBlurBackgroundColor = (theme: Theme): string => {
  switch (theme) {
    case "dark":
      return "rgba(8, 8, 8, 0.5)"
    case "true dark":
      return "rgba(0, 0, 0, 0.5)"
    default:
      return "rgba(255, 255, 255, 0.5)"
  }
}

export const getBlurIntensity = (theme: Theme): number => {
  switch (theme) {
    case "dark":
      return 50
    case "true dark":
      return 50
    default:
      return 50
  }
}

export const getSecondaryBackgroundColor = (theme: Theme): string => {
  switch (theme) {
    case "dark":
      return "#0F0F0F"
    case "true dark":
      return "#070707"
    default:
      return "#F2F2F2"
  }
}

export const getBlurSecondaryBackgroundColor = (theme: Theme): string => {
  switch (theme) {
    case "dark":
      return "rgb(15, 15, 15, 0.5)"
    case "true dark":
      return "rgb(7, 7, 7, 0.5)"
    default:
      return "rgb(242, 242, 242, 0.6)"
  }
}

export const getBorderColor = (theme: Theme): string => {
  switch (theme) {
    case "dark":
      return "#272729"
    case "true dark":
      return "#0F0F0F"
    default:
      return "#e5e7eb"
  }
}

export const getTextColor = (theme: Theme): string => {
  if (theme === "light") return "black"
  return "white"
}

export const getThemeColor = (theme: Theme): string => {
  if (theme === "light") return "black"
  return "white"
}
