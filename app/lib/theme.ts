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

// Shared dock metrics: floating search bars, composer inputs and FABs sit on
// the same grid on every screen (home, recipes, online recipes, search,
// weekly, logs) so they look identical across pages.
export const BAR_HEIGHT = 52
export const FAB_SIZE = 52
export const FAB_ICON_SIZE = 22
export const DOCK_BOTTOM = 24
export const DOCK_SIDE = 24
export const DOCK_GAP = 16
// Right offset for a search bar docked next to one FAB.
export const SEARCH_BAR_RIGHT = DOCK_SIDE + FAB_SIZE + DOCK_GAP // 92
// Right offset for a search bar docked next to two FABs (e.g. recipes filter + create).
export const SEARCH_BAR_RIGHT_DOUBLE = DOCK_SIDE + FAB_SIZE + DOCK_GAP + FAB_SIZE + DOCK_GAP // 160
export const BAR_PADDING_H = 17
export const BAR_FONT_SIZE = 17
// The clear (X) button inside a dock bar.
export const BAR_CLEAR_ICON_SIZE = 18
// Primary action buttons pinned to the bottom of bottom sheets and modals
// (create/update recipe, done, primary/secondary modal actions).
export const SHEET_CTA_HEIGHT = 50
// Composer inputs (home, weekly, edit-product, assistant) render the same
// single-line height as search bars.
export const COMPOSER_MIN_HEIGHT = BAR_HEIGHT
export const COMPOSER_SEND_SIZE = 36
