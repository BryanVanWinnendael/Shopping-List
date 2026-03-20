import Drawer from "expo-router/drawer"
import { KeyboardAvoidingView, Platform, StatusBar } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { CustomDrawerContent } from "@/components/customDrawerContent"
import { UserProfile } from "@/components/users/userProfile"
import { Header } from "@/components/header"
import { useEffect, useRef } from "react"
import { useSettings } from "@/stores/useSettings"
import { usePathname } from "expo-router"
import {
  List,
  BookOpen,
  Settings,
  TagIcon,
  Bookmark,
  Search,
  CalendarPlus,
  CalendarCog,
} from "lucide-react-native"
import { getBackgroundColor, getTextColor } from "@/lib/theme"
import { ThemeSwitcherSheet } from "@/components/themes/themeSwitcherSheet"
import { SelectUser } from "@/components/users/selectUser"
import { UserSheet } from "@/components/users/userSheet"
import { CustomHeader } from "@/components/customHeader"
import { PressablesConfig } from "pressto"
import * as Haptics from "expo-haptics"
import ItemSearchSheet from "@/components/list/itemSearchSheet"
import BottomSheet from "@gorhom/bottom-sheet"
import { useInteractions } from "@/stores/useInteractions"
import { useRecipes } from "@/stores/useRecipes"
import { ADMIN_USERS_ARRAY } from "@/lib/constants"

const ICON_SIZE = 18

export default function RootLayout() {
  const { setSearchSheet } = useInteractions()
  const searchItemBottomSheetRef = useRef<BottomSheet>(null)
  const loadSettings = useSettings((state) => state.loadSettings)
  const loadRecipes = useRecipes((state) => state.loadRecipes)
  const { user, theme } = useSettings()
  const pathname = usePathname()

  const backgroundColor = getBackgroundColor(theme)
  const textColor = getTextColor(theme)

  // true when inside /recipes/[id]
  const inRecipeDetail = /^\/recipes\/[^/]+$/.test(pathname)

  useEffect(() => {
    loadSettings()
    loadRecipes()

    setSearchSheet(searchItemBottomSheetRef)
  }, [user])

  return (
    <PressablesConfig
      animationType="spring"
      animationConfig={{ damping: 30, stiffness: 200 }}
      config={{ minScale: 0.9, activeOpacity: 0.6 }}
      globalHandlers={{
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        },
      }}
    >
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor, height: "100%" }}
      >
        <SelectUser />
        <StatusBar
          barStyle={theme === "light" ? "dark-content" : "light-content"}
          animated
        />
        <KeyboardAvoidingView
          style={{ flex: 1, height: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <Drawer
            screenOptions={({ navigation }) => ({
              drawerActiveTintColor: textColor,
              drawerInactiveTintColor: textColor,
              drawerActiveBackgroundColor: "transparent",
              drawerItemStyle: { borderRadius: 8 },
              drawerLabelStyle: { fontSize: 15, fontWeight: "500" },
              headerLeft: () =>
                inRecipeDetail ? null : (
                  <UserProfile onPress={navigation.toggleDrawer} />
                ),
              headerTitle: () => (inRecipeDetail ? null : <Header />),
              headerBackground: () =>
                inRecipeDetail ? null : <CustomHeader />,
              headerStyle: { backgroundColor: "transparent" },
            })}
            drawerContent={CustomDrawerContent}
          >
            <Drawer.Screen
              name="index"
              options={{
                drawerLabel: "List",
                title: "",
                headerTransparent: true,
                drawerIcon: ({ color }) => (
                  <List color={color} size={ICON_SIZE} strokeWidth={2} />
                ),
              }}
            />

            <Drawer.Screen
              name="recipes"
              options={{
                drawerLabel: "Recipes",
                title: "",
                headerTransparent: true,
                drawerIcon: ({ color }) => (
                  <Bookmark color={color} size={ICON_SIZE} strokeWidth={2} />
                ),
              }}
            />

            <Drawer.Screen
              name="search"
              options={{
                drawerLabel: "Search",
                title: "",
                headerTransparent: true,
                drawerIcon: ({ color }) => (
                  <Search color={color} size={ICON_SIZE} strokeWidth={2} />
                ),
              }}
            />

            <Drawer.Screen
              name="weekly"
              options={{
                drawerLabel: "Weekly List",
                title: "",
                headerTransparent: true,
                drawerIcon: ({ color }) => (
                  <CalendarPlus
                    color={color}
                    size={ICON_SIZE}
                    strokeWidth={2}
                  />
                ),
              }}
            />

            <Drawer.Screen
              name="logs"
              options={{
                drawerLabel: "Logs",
                title: "",
                headerTransparent: true,
                drawerItemStyle: {
                  display: ADMIN_USERS_ARRAY.includes(user ?? "")
                    ? "flex"
                    : "none",
                  borderRadius: 8,
                },
                drawerIcon: ({ color }) => (
                  <BookOpen color={color} size={ICON_SIZE} strokeWidth={2} />
                ),
              }}
            />

            <Drawer.Screen
              name="categories"
              options={{
                drawerLabel: "Categories",
                title: "",
                headerTransparent: true,
                drawerItemStyle: {
                  display: ADMIN_USERS_ARRAY.includes(user ?? "")
                    ? "flex"
                    : "none",
                  borderRadius: 8,
                },
                drawerIcon: ({ color }) => (
                  <TagIcon color={color} size={ICON_SIZE} strokeWidth={2} />
                ),
              }}
            />

            <Drawer.Screen
              name="weeklyCategories"
              options={{
                drawerLabel: "Weekly Categories",
                title: "",
                headerTransparent: true,
                drawerItemStyle: {
                  display: ADMIN_USERS_ARRAY.includes(user ?? "")
                    ? "flex"
                    : "none",
                  borderRadius: 8,
                },
                drawerIcon: ({ color }) => (
                  <CalendarCog color={color} size={ICON_SIZE} strokeWidth={2} />
                ),
              }}
            />

            <Drawer.Screen
              name="settings"
              options={{
                drawerLabel: "Settings",
                title: "",
                headerTransparent: true,
                drawerIcon: ({ color }) => (
                  <Settings color={color} size={ICON_SIZE} strokeWidth={2} />
                ),
              }}
            />
          </Drawer>
        </KeyboardAvoidingView>

        <ThemeSwitcherSheet />
        <UserSheet />
        <ItemSearchSheet />
      </GestureHandlerRootView>
    </PressablesConfig>
  )
}
