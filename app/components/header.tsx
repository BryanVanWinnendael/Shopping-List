import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { useProductsListStore } from "@/stores/useProductsListStore"
import ListHeader from "@/components/listHeader"
import useThemes from "@/hooks/themes/useThemes"
import { useHeaderStore } from "@/stores/useHeaderStore"
import { usePathname } from "expo-router"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

const ROUTE_TITLES: Record<string, string> = {
    weeklyCategories: "Weekly Categories",
    weekly: "Weekly List",
}

const HEADER_MAX_WIDTH = 220
const HEADER_HORIZONTAL_PADDING = 28
const CONTENT_MAX_WIDTH = HEADER_MAX_WIDTH - HEADER_HORIZONTAL_PADDING

export default function Header() {
    const { vars } = useThemes()
    const { products } = useProductsListStore()
    const { headers } = useHeaderStore()
    const pathname = usePathname()

    const totalProducts = products ? Object.keys(products).length : 0

    const currentRouteName = pathname === "/" ? "index" : (pathname.split("/").filter(Boolean).pop() ?? "index")

    const headerTitle =
        ROUTE_TITLES[currentRouteName] ?? currentRouteName.charAt(0).toUpperCase() + currentRouteName.slice(1)

    const getCustomHeaderTitle = () => {
        const text = headers[currentRouteName as keyof typeof headers]

        return (
            <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.title, { color: vars.textColor, maxWidth: CONTENT_MAX_WIDTH, flexShrink: 1 }]}
            >
                {text || headerTitle}
            </Text>
        )
    }

    return (
        <View style={styles.outerContainer}>
            <LiquidGlassView style={styles.glass} isInteractive>
                {products === null ? (
                    <ActivityIndicator size="small" color={vars.textColor} />
                ) : currentRouteName !== "index" ? (
                    getCustomHeaderTitle()
                ) : totalProducts > 0 ? (
                    <ListHeader maxWidth={CONTENT_MAX_WIDTH} />
                ) : (
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.title, { color: vars.textColor, maxWidth: CONTENT_MAX_WIDTH }]}
                    >
                        No products yet
                    </Text>
                )}
            </LiquidGlassView>
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        fontWeight: "600",
        fontSize: 16,
    },
    outerContainer: {
        width: "100%",
        alignItems: "flex-end",
        marginRight: 12,
    },
    glass: {
        minHeight: 40,
        maxWidth: HEADER_MAX_WIDTH,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
})
