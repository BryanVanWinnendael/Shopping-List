import { create } from "zustand"
import {
  AColorUse,
  ItemType,
  Notifications,
  Theme,
  UserColorSettings,
  Users,
} from "@/types"
import {
  DEFAULT_USERCOLORS,
  getUser,
  getUserColors,
  setUser,
  setUserColors,
} from "@/lib/user"
import {
  DEFAULT_ACOLOR,
  DEFAULT_ACOLORUSE,
  getAColor,
  getAColorUse,
  getTheme,
  setAColor,
  setAColorUse,
  setTheme,
} from "@/lib/theme"
import {
  getFontSize,
  getMenuIcon,
  getNewUI,
  getNotifications,
  setFontSize,
  setMenuIcon,
  setNewUI,
  setNotifications,
} from "@/lib/settings"

type SettingsState = {
  fontSize: number
  user: Users | null
  theme: Theme
  aColor: string
  aColorUse: AColorUse
  userColors: UserColorSettings
  menuIcon: boolean
  showThemeSheet: boolean
  showFontSizeSheet: boolean
  showUserSheet: boolean
  editItem: ItemType | null
  notifications: Notifications
  newUI: boolean

  setFontSize: (value: number) => void
  loadSettings: () => Promise<void>
  setUser: (user: Users) => Promise<void>
  setTheme: (theme: Theme) => void
  setAColor: (color: string) => void
  setAColorUse: (use: AColorUse) => void
  setUserColors: (userColors: UserColorSettings) => void
  setMenuIcon: (value: boolean) => void
  setShowThemeSheet: (value: boolean) => void
  setShowFontSizeSheet: (value: boolean) => void
  setShowUserSheet: (value: boolean) => void
  setEditItem: (item: ItemType | null) => void
  setNotifications: (notifications: Notifications) => void
  setNewUI: (value: boolean) => void
}

export const useSettings = create<SettingsState>((set) => ({
  fontSize: 35,
  user: null,
  theme: "light",
  aColor: DEFAULT_ACOLOR,
  aColorUse: DEFAULT_ACOLORUSE,
  userColors: DEFAULT_USERCOLORS,
  menuIcon: true,
  showThemeSheet: false,
  showFontSizeSheet: false,
  recipes: [],
  showUserSheet: false,
  editItem: null,
  favoriteRecipes: [],
  notifications: {
    added: false,
    removed: false,
    timed: false,
    expoToken: null,
  },
  newUI: false,

  loadSettings: async () => {
    const storedFontSize = await getFontSize()
    if (storedFontSize !== null) {
      set({ fontSize: parseInt(storedFontSize, 10) })
    }

    const storedUser = await getUser()
    if (storedUser !== null) {
      set({ user: storedUser as Users })
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

    const storedMenuIcon = await getMenuIcon()
    if (storedMenuIcon !== null) {
      set({ menuIcon: storedMenuIcon })
    }

    const storedNotifications = await getNotifications()
    if (storedNotifications !== null) {
      set({ notifications: storedNotifications })
    }

    const storedNewUI = await getNewUI()
    if (storedNewUI !== null) {
      set({ newUI: storedNewUI })
    }
  },

  setUser: async (user: Users) => {
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

  setMenuIcon: async (value: boolean) => {
    set({ menuIcon: value })
    await setMenuIcon(value)
  },

  setShowThemeSheet: (value: boolean) => set({ showThemeSheet: value }),

  setShowFontSizeSheet: (value: boolean) => set({ showFontSizeSheet: value }),

  setShowUserSheet: (value: boolean) => set({ showUserSheet: value }),

  setEditItem: (item) => set({ editItem: item }),

  setNotifications: async (notifications: Notifications) => {
    set({ notifications })
    await setNotifications(notifications)
  },

  setNewUI: async (ui: boolean) => {
    set({ newUI: ui })
    await setNewUI(ui)
  },
}))
