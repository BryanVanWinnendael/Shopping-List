import Drawer from "expo-router/drawer"
import {KeyboardAvoidingView, Platform, StatusBar} from "react-native"
import {GestureHandlerRootView} from "react-native-gesture-handler"
import CustomDrawerContent from "@/components/customDrawerContent"
import NavButton from "@/components/navButton"
import Header from "@/components/header"
import {useEffect} from "react"
import {useSettingsStore} from "@/stores/useSettingsStore"
import {usePathname} from "expo-router"
import ThemesBottomSheet from "@/components/themes/bottomSheet"
import SelectUser from "@/components/users/selectUser"
import UsersBottomSheet from "@/components/users/bottomSheet"
import CustomHeader from "@/components/customHeader"
import {PressablesConfig} from "pressto"
import * as Haptics from "expo-haptics"
import {useRecipesStore} from "@/stores/useRecipesStore"
import {ADMIN_USERS_ARRAY} from "@/lib/constants"
import GradientBackground from "@/components/gradientBackground"
import useThemes from "@/hooks/themes/useThemes"
import useUsers from "@/hooks/users/useUsers"
import Toast from "react-native-toast-message"
import Success from "@/components/toasts/success"
import Error from "@/components/toasts/error"
import {useNotificationsStore} from "@/stores/useNotificationsStore"
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

const ICON_SIZE = 18

export default function RootLayout() {
    const { vars } = useThemes()
    const loadRecipes = useRecipesStore((state) => state.loadRecipes)
    const loadSettings = useSettingsStore((state) => state.loadSettings)
    const loadNotifications = useNotificationsStore((state) => state.loadNotifications)
    const { user, theme } = useSettingsStore()
    const { actions: themesActions, refs: themesRefs } = useThemes()
    const { actions: usersActions, refs: usersRefs } = useUsers()
    const pathname = usePathname()

    // true when inside /recipes/[id]
    const inRecipeDetail = /^\/recipes\/[^/]+$/.test(pathname) || /^\/online-recipes\/[^/]+$/.test(pathname)

    useEffect(() => {
        loadSettings()
        loadRecipes()
        loadNotifications()
    }, [user])

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
                                sceneContainerStyle: {
                                    borderRadius: 120,
                                    overflow: "hidden",
                                    backgroundColor: vars.backgroundColor,
                                },
                                drawerActiveTintColor: vars.textColor,
                                drawerInactiveTintColor: vars.textColor,
                                drawerActiveBackgroundColor: "transparent",
                                drawerItemStyle: { borderRadius: 8 },
                                drawerLabelStyle: {
                                    fontSize: 15,
                                    fontWeight: "500",
                                },
                                headerLeft: () =>
                                    inRecipeDetail ? null : <NavButton open={navigation.toggleDrawer} />,
                                headerTitle: () => (inRecipeDetail ? null : <Header />),
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
                                    drawerLabel: "Search Recipes",
                                    title: "",
                                    headerTransparent: true,
                                    drawerIcon: ({ color }) => (
                                        <TextSearch color={color} size={ICON_SIZE} strokeWidth={2} />
                                    ),
                                }}
                            />

                            <Drawer.Screen
                                name="search"
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
                                        display: ADMIN_USERS_ARRAY.includes(user ?? "") ? "flex" : "none",
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
                                        display: ADMIN_USERS_ARRAY.includes(user ?? "") ? "flex" : "none",
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

                    <ThemesBottomSheet sheetRef={themesRefs.bottomSheetRef} close={themesActions.close} />
                    <UsersBottomSheet close={usersActions.close} sheetRef={usersRefs.bottomSheetRef} />
                    <Toast
                        config={{
                            success: ({ text1, text2 }: any) => <Success text1={text1} text2={text2} />,
                            error: ({ text1, text2 }: any) => <Error text1={text1} text2={text2} />,
                        }}
                        topOffset={60}
                    />
                </GestureHandlerRootView>
            </PressablesConfig>
        </>
    )
}
