import { useCallback, useEffect, useRef } from "react"
import { Appearance, KeyboardAvoidingView, Platform, StatusBar, StyleSheet } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import Drawer from "expo-router/drawer"
import { usePathname } from "expo-router"
import { PressablesConfig } from "pressto"
import * as Haptics from "expo-haptics"
import Toast, { ToastConfig } from "react-native-toast-message"
import {
    Bookmark,
    BookOpen,
    CalendarCog,
    CalendarPlus,
    List,
    LucideIcon,
    Search,
    Settings,
    TagIcon,
    TextSearch,
} from "lucide-react-native"
import CustomDrawerContent from "@/components/customDrawerContent"
import NavButton from "@/components/navButton"
import Header from "@/components/header"
import CustomHeader from "@/components/customHeader"
import GradientBackground from "@/components/gradientBackground"
import ThemesBottomSheet from "@/components/themes/bottomSheet"
import UsersBottomSheet from "@/components/users/bottomSheet"
import SelectUser from "@/components/users/selectUser"
import AiChatBottomSheet from "@/components/ai/chatBottomSheet"
import SuccessToast from "@/components/toasts/success"
import ErrorToast from "@/components/toasts/error"
import { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import useThemes from "@/hooks/themes/useThemes"
import useUsers from "@/hooks/users/useUsers"
import { useShake } from "@/hooks/useShake"
import { useNetworkMonitor } from "@/hooks/useNetworkMonitor"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { useNotificationsStore } from "@/stores/useNotificationsStore"
import { useAiContextStore } from "@/stores/useAiContextStore"
import { ADMIN_USERS_ARRAY } from "@/lib/constants"

const ICON_SIZE = 18

// Matches /recipes/[id] and /online-recipes/[id]
const RECIPE_DETAIL_REGEX = /^\/(online-)?recipes\/[^/]+$/

const softHaptic = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
}

type DrawerScreen = {
    name: string
    label: string
    Icon: LucideIcon
    adminOnly?: boolean
}

const DRAWER_SCREENS: DrawerScreen[] = [
    { name: "index", label: "List", Icon: List },
    { name: "recipes", label: "Recipes", Icon: Bookmark },
    { name: "online-recipes", label: "Online Recipes", Icon: TextSearch },
    { name: "searchProducts", label: "Search Products", Icon: Search },
    { name: "weekly", label: "Weekly List", Icon: CalendarPlus },
    { name: "logs", label: "Logs", Icon: BookOpen, adminOnly: true },
    { name: "categories", label: "Categories", Icon: TagIcon, adminOnly: true },
    { name: "weeklyCategories", label: "Weekly Categories", Icon: CalendarCog, adminOnly: true },
    { name: "settings", label: "Settings", Icon: Settings },
]

const PRESSABLES_ANIMATION_CONFIG = { damping: 30, stiffness: 200 }
const PRESSABLES_CONFIG = { minScale: 0.9, activeOpacity: 0.6 }
const PRESSABLES_HANDLERS = { onPress: softHaptic }

const TOAST_CONFIG: ToastConfig = {
    success: ({ text1, text2 }) => <SuccessToast text1={text1} text2={text2} />,
    error: ({ text1, text2 }) => <ErrorToast text1={text1} text2={text2} />,
}

export default function RootLayout() {
    const { vars, appearance, actions: themesActions, refs: themesRefs } = useThemes()
    const { actions: usersActions, refs: usersRefs } = useUsers()

    const provider = useAiContextStore((state) => state.provider)
    const loadProvider = useAiContextStore((state) => state.loadProvider)
    const user = useSettingsStore((state) => state.user)
    const theme = useSettingsStore((state) => state.theme)
    const loadSettings = useSettingsStore((state) => state.loadSettings)
    const loadRecipes = useRecipesStore((state) => state.loadRecipes)
    const loadNotifications = useNotificationsStore((state) => state.loadNotifications)

    const pathname = usePathname()
    const assistantSheetRef = useRef<BottomSheetRef>(null)

    const inRecipeDetail = RECIPE_DETAIL_REGEX.test(pathname)
    const isAdmin = ADMIN_USERS_ARRAY.includes(user ?? "")

    const openAssistant = useCallback(() => {
        if (provider === "disabled") return

        softHaptic()
        assistantSheetRef.current?.expand()
    }, [provider])

    const closeAssistant = useCallback(() => {
        assistantSheetRef.current?.close()
    }, [])

    useEffect(() => {
        loadProvider()
    }, [loadProvider])

    useEffect(() => {
        loadSettings()
        loadRecipes()
        loadNotifications()
    }, [user])

    useEffect(() => {
        Appearance.setColorScheme(appearance ?? null) // null = follow system
    }, [appearance])

    useShake(openAssistant)
    useNetworkMonitor()

    return (
        <PressablesConfig
            animationType="spring"
            animationConfig={PRESSABLES_ANIMATION_CONFIG}
            config={PRESSABLES_CONFIG}
            globalHandlers={PRESSABLES_HANDLERS}
        >
            <GestureHandlerRootView style={[styles.root, { backgroundColor: vars.backgroundColor }]}>
                <SelectUser />
                <GradientBackground />
                <StatusBar barStyle={theme === "light" ? "dark-content" : "light-content"} animated />

                <KeyboardAvoidingView
                    style={styles.fill}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={0}
                >
                    <Drawer
                        screenListeners={{ drawerItemPress: softHaptic }}
                        screenOptions={({ navigation }) => ({
                            title: "",
                            headerTransparent: true,
                            headerStyle: styles.transparentHeader,
                            headerLeft: () => (inRecipeDetail ? null : <NavButton open={navigation.toggleDrawer} />),
                            headerRight: () => (inRecipeDetail ? null : <Header />),
                            headerBackground: () => (inRecipeDetail ? null : <CustomHeader />),
                            swipeEdgeWidth: 200,
                            lazy: true,
                            detachInactiveScreens: true,
                            drawerType: "slide",
                            drawerActiveTintColor: vars.textColor,
                            drawerInactiveTintColor: vars.textColor,
                            drawerActiveBackgroundColor: "transparent",
                            drawerLabelStyle: styles.drawerLabel,
                        })}
                        drawerContent={(props) => (
                            <CustomDrawerContent
                                {...props}
                                openThemes={themesActions.open}
                                openUsers={usersActions.open}
                            />
                        )}
                    >
                        {DRAWER_SCREENS.map(({ name, label, Icon, adminOnly }) => (
                            <Drawer.Screen
                                key={name}
                                name={name}
                                options={{
                                    drawerLabel: label,
                                    drawerIcon: ({ color }) => <Icon color={color} size={ICON_SIZE} strokeWidth={2} />,
                                    drawerItemStyle: adminOnly && !isAdmin ? styles.hidden : undefined,
                                }}
                            />
                        ))}
                    </Drawer>
                </KeyboardAvoidingView>

                <ThemesBottomSheet sheetRef={themesRefs.bottomSheetRef} close={themesActions.close} />
                <UsersBottomSheet sheetRef={usersRefs.bottomSheetRef} close={usersActions.close} />
                <AiChatBottomSheet pathname={pathname} sheetRef={assistantSheetRef} onClose={closeAssistant} />

                <Toast config={TOAST_CONFIG} topOffset={100} />
            </GestureHandlerRootView>
        </PressablesConfig>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        height: "100%",
    },
    fill: {
        flex: 1,
        height: "100%",
    },
    transparentHeader: {
        backgroundColor: "transparent",
    },
    drawerLabel: {
        fontSize: 15,
        fontWeight: "500",
    },
    hidden: {
        display: "none",
    },
})
