import { ActivityIndicator, Text, View } from "react-native"
import { useProductsListStore } from "@/stores/useProductsListStore"
import ListHeader from "@/components/listHeader"
import useThemes from "@/hooks/themes/useThemes"
import { useHeaderStore } from "@/stores/useHeaderStore"
import { usePathname } from "expo-router"

const ROUTE_TITLES: Record<string, string> = {
    weeklyCategories: "Weekly Categories",
    weekly: "Weekly List",
}

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

        if (text) {
            return (
                <Text
                    style={{
                        fontWeight: "600",
                        fontSize: 16,
                        color: vars.textColor,
                    }}
                >
                    {text}
                </Text>
            )
        }

        return (
            <Text
                style={{
                    fontWeight: "600",
                    fontSize: 16,
                    color: vars.textColor,
                }}
            >
                {headerTitle}
            </Text>
        )
    }

    return (
        <View style={{ alignItems: "center" }}>
            {products === null ? (
                <ActivityIndicator size="small" color={vars.textColor} />
            ) : currentRouteName !== "index" ? (
                getCustomHeaderTitle()
            ) : totalProducts > 0 ? (
                <ListHeader />
            ) : (
                <Text
                    style={{
                        fontWeight: "600",
                        fontSize: 16,
                        color: vars.textColor,
                    }}
                >
                    No products yet
                </Text>
            )}
        </View>
    )
}
