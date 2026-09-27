import Drawer from "expo-router/drawer"
import { KeyboardAvoidingView, Platform, StatusBar } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import CustomDrawerContent from "@/components/customDrawerContent"
import NavButton from "@/components/navButton"
import Header from "@/components/header"
import { useCallback, useEffect, useRef } from "react"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { usePathname } from "expo-router"
import ThemesBottomSheet from "@/components/themes/bottomSheet"
import SelectUser from "@/components/users/selectUser"
import UsersBottomSheet from "@/components/users/bottomSheet"
import CustomHeader from "@/components/customHeader"
import { PressablesConfig } from "pressto"
import * as Haptics from "expo-haptics"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { ADMIN_USERS_ARRAY } from "@/lib/constants"
import GradientBackground from "@/components/gradientBackground"
import useThemes from "@/hooks/themes/useThemes"
import useUsers from "@/hooks/users/useUsers"
import Toast from "react-native-toast-message"
import Success from "@/components/toasts/success"
import Error from "@/components/toasts/error"
import AiChatBottomSheet from "@/components/ai/chatBottomSheet"
import { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import { useShake } from "@/hooks/useShake"
import { useNotificationsStore } from "@/stores/useNotificationsStore"
import {
    Bookmark,
    BookOpen,
    CalendarCog,
    CalendarPlus,
    List,
    Search,
    Settings,
    TagIcon,
    TextSearch,
} from "lucide-react-native"
import { useNetworkMonitor } from "@/hooks/useNetworkMonitor"
import { useAiContextStore } from "@/stores/useAiContextStore"

const ICON_SIZE = 18

export default function RootLayout() {
    const { vars } = useThemes()
    const { actions: themesActions, refs: themesRefs } = useThemes()
    const { actions: usersActions, refs: usersRefs } = useUsers()
    const { provider } = useAiContextStore()
    const { user, theme } = useSettingsStore()

    const loadRecipes = useRecipesStore((state) => state.loadRecipes)
    const loadSettings = useSettingsStore((state) => state.loadSettings)

    const loadNotifications = useNotificationsStore((state) => state.loadNotifications)

    const loadProvider = useAiContextStore((state) => state.loadProvider)

    const pathname = usePathname()
    const assistantSheetRef = useRef<BottomSheetRef>(null)

    // true when inside /recipes/[id]
    const inRecipeDetail = /^\/recipes\/[^/]+$/.test(pathname) || /^\/online-recipes\/[^/]+$/.test(pathname)

    const openAssistant = useCallback(() => {
        if (provider === "disabled") {
            return
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        assistantSheetRef.current?.expand()
    }, [provider])

    useEffect(() => {
        loadSettings()
        loadRecipes()
        loadNotifications()
        loadProvider()
    }, [user])

    useShake(openAssistant)
    useNetworkMonitor()

    return (
        <>
            <PressablesConfig
                animationType="spring"
                animationConfig={{ damping: 30, stiffness: 200 }}
                config={{ minScale: 0.9, activeOpacity: 0.6 }}
                globalHandlers={{
                    onPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                    },
                }}
            >
                <GestureHandlerRootView
                    style={{
                        flex: 1,
                        backgroundColor: vars.backgroundColor,
                        height: "100%",
                    }}
                >
                    <SelectUser />
                    <GradientBackground />
                    <StatusBar barStyle={theme === "light" ? "dark-content" : "light-content"} animated />
                    <KeyboardAvoidingView
                        style={{ flex: 1, height: "100%" }}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        keyboardVerticalOffset={0}
                    >
                        <Drawer
                            screenListeners={{
                                drawerItemPress: () => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                                },
                            }}
                            screenOptions={({ navigation }) => ({
                                swipeEdgeWidth: 200,
                                lazy: true,
                                detachInactiveScreens: true,
                                drawerType: "slide",
                                drawerActiveTintColor: vars.textColor,
                                drawerInactiveTintColor: vars.textColor,
                                drawerActiveBackgroundColor: "transparent",
                                drawerLabelStyle: {
                                    fontSize: 15,
                                    fontWeight: "500",
                                },
                                headerLeft: () =>
                                    inRecipeDetail ? null : <NavButton open={navigation.toggleDrawer} />,
                                headerRight: () => (inRecipeDetail ? null : <Header />),
                                headerBackground: () => (inRecipeDetail ? null : <CustomHeader />),
                                headerStyle: { backgroundColor: "transparent" },
                            })}
                            drawerContent={(props) => (
                                <CustomDrawerContent
                                    {...props}
                                    openThemes={themesActions.open}
                                    openUsers={usersActions.open}
                                />
                            )}
                        >
                            <Drawer.Screen
                                name="index"
                                options={{
                                    drawerLabel: "List",
                                    title: "",
                                    headerTransparent: true,
                                    drawerIcon: ({ color }) => <List color={color} size={ICON_SIZE} strokeWidth={2} />,
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
                                name="online-recipes"
                                options={{
                                    drawerLabel: "Online Recipes",
                                    title: "",
                                    headerTransparent: true,
                                    drawerIcon: ({ color }) => (
                                        <TextSearch color={color} size={ICON_SIZE} strokeWidth={2} />
                                    ),
                                }}
                            />

                            <Drawer.Screen
                                name="searchProducts"
                                options={{
                                    drawerLabel: "Search Products",
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
                                        <CalendarPlus color={color} size={ICON_SIZE} strokeWidth={2} />
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
                                        display: ADMIN_USERS_ARRAY.includes(user ?? "") ? "flex" : "none",
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
                                        display: ADMIN_USERS_ARRAY.includes(user ?? "") ? "flex" : "none",
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
                                        display: ADMIN_USERS_ARRAY.includes(user ?? "") ? "flex" : "none",
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

                    <ThemesBottomSheet sheetRef={themesRefs.bottomSheetRef} close={themesActions.close} />
                    <UsersBottomSheet close={usersActions.close} sheetRef={usersRefs.bottomSheetRef} />
                    <AiChatBottomSheet
                        pathname={pathname}
                        sheetRef={assistantSheetRef}
                        onClose={() => assistantSheetRef.current?.close()}
                    />
                    <Toast
                        config={{
                            success: ({ text1, text2 }: any) => <Success text1={text1} text2={text2} />,
                            error: ({ text1, text2 }: any) => <Error text1={text1} text2={text2} />,
                        }}
                        topOffset={100}
                    />
                </GestureHandlerRootView>
            </PressablesConfig>
        </>
    )
}
