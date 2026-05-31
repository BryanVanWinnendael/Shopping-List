import { create } from "zustand"
import { AColorUse, Theme, User, UserColorSettings } from "@/types"
import { DEFAULT_USERCOLORS, getUser, getUserColors, setUser, setUserColors } from "@/lib/user"
import { DEFAULT_ACOLOR, DEFAULT_ACOLORUSE, getTheme, setTheme } from "@/lib/theme"
import {
    getAColor,
    getAColorUse,
    getFontSize,
    getNewUI,
    setAColor,
    setAColorUse,
    setFontSize,
    setNewUI,
} from "@/lib/settings"

type SettingsState = {
    fontSize: number
    user: User | null
    theme: Theme
    aColor: string
    aColorUse: AColorUse
    userColors: UserColorSettings
    showFontSizeSheet: boolean
    newUI: boolean

    setFontSize: (value: number) => void
    loadSettings: () => Promise<void>
    setUser: (user: User) => Promise<void>
    setTheme: (theme: Theme) => void
    setAColor: (color: string) => void
    setAColorUse: (use: AColorUse) => void
    setUserColors: (userColors: UserColorSettings) => void
    setShowFontSizeSheet: (value: boolean) => void
    setNewUI: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
    fontSize: 35,
    user: null,
    theme: "light",
    aColor: DEFAULT_ACOLOR,
    aColorUse: DEFAULT_ACOLORUSE,
    userColors: DEFAULT_USERCOLORS,
    menuIcon: true,
    showFontSizeSheet: false,
    recipes: [],
    showUserSheet: false,
    favoriteRecipes: [],
    notifications: {
        create: false,
        delete: false,
        cron: false,
        expoToken: null,
    },
    newUI: false,
    useHeaderColor: false,

    loadSettings: async () => {
        const storedFontSize = await getFontSize()
        if (storedFontSize !== null) {
            set({ fontSize: parseInt(storedFontSize, 10) })
        }

        const storedUser = await getUser()
        if (storedUser !== null) {
            set({ user: storedUser })
        }

        const storedTheme = await getTheme()
        if (storedTheme !== null) {
            set({ theme: storedTheme as Theme })
        }

        const storedAColor = await getAColor()
        if (storedAColor !== null) {
            set({ aColor: storedAColor })
        }

        const storedAColorUse = await getAColorUse()
        if (storedAColorUse !== null) {
            set({ aColorUse: storedAColorUse })
        }

        const storedUserColors = await getUserColors()
        if (storedUserColors !== null) {
            set({ userColors: storedUserColors })
        }

        const storedNewUI = await getNewUI()
        if (storedNewUI !== null) {
            set({ newUI: storedNewUI })
        }
    },

    setUser: async (user: User) => {
        set({ user })
        await setUser(user)
    },

    setTheme: async (theme: Theme) => {
        set({ theme })
        await setTheme(theme)
    },

    setFontSize: async (value: number) => {
        set({ fontSize: value })
        await setFontSize(value)
    },

    setAColor: async (aColor: string) => {
        set({ aColor })
        await setAColor(aColor)
    },

    setAColorUse: async (aColorUse: AColorUse) => {
        set({ aColorUse })
        await setAColorUse(aColorUse)
    },

    setUserColors: async (userColors: UserColorSettings) => {
        set({ userColors })
        await setUserColors(userColors)
    },

    setShowFontSizeSheet: (value: boolean) => set({ showFontSizeSheet: value }),

    setNewUI: async (value: boolean) => {
        set({ newUI: value })
        await setNewUI(value)
    },
}))
