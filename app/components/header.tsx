import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { useProductsListStore } from "@/stores/useProductsListStore"
import ListHeader from "@/components/listHeader"
import useThemes from "@/hooks/themes/useThemes"
import { useHeaderStore } from "@/stores/useHeaderStore"
import { usePathname } from "expo-router"
import { GlassView } from "expo-glass-effect"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

const ROUTE_TITLES: Record<string, string> = {
    weeklyCategories: "Weekly Categories",
    weekly: "Weekly List",
}

const HEADER_MAX_WIDTH = 220
const HEADER_HORIZONTAL_PADDING = 28
const CONTENT_MAX_WIDTH = HEADER_MAX_WIDTH - HEADER_HORIZONTAL_PADDING

export default function Header() {
    const { vars, theme } = useThemes()
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
                style={{
                    fontWeight: "600",
                    fontSize: 16,
                    color: vars.textColor,
                    maxWidth: CONTENT_MAX_WIDTH,
                    flexShrink: 1,
                }}
            >
                {text || headerTitle}
            </Text>
        )
    }

    return (
        <View style={styles.outerContainer}>
            <GlassView
                glassEffectStyle="regular"
                isInteractive
                colorScheme={theme === "light" ? "light" : "dark"}
                style={styles.glass}
            >
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
                        style={{
                            fontWeight: "600",
                            fontSize: 16,
                            color: vars.textColor,
                            maxWidth: CONTENT_MAX_WIDTH,
                        }}
                    >
                        No products yet
                    </Text>
                )}
            </GlassView>
        </View>
    )
}

const styles = StyleSheet.create({
    outerContainer: {
        width: "100%",
        alignItems: "flex-end" as const,
        marginRight: 12,
    },
    glass: {
        minHeight: 40,
        maxWidth: HEADER_MAX_WIDTH,
        borderRadius: BORDER_RADIUS_FULL,
        justifyContent: "center" as const,
        alignItems: "center" as const,
        paddingHorizontal: 14,
        overflow: "hidden" as const,
    },
})
