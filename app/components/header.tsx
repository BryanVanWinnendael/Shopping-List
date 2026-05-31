import { ActivityIndicator, Text, View } from "react-native"
import { useNavigationState } from "@react-navigation/native"
import { useProductsListStore } from "@/stores/useProductsListStore"
import ListHeader from "@/components/listHeader"
import useThemes from "@/hooks/themes/useThemes"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { useProductsSearchStore } from "@/stores/useProductsSearchStore"

const ROUTE_TITLES: Record<string, string> = {
    weeklyCategories: "Weekly Categories",
    weekly: "Weekly List",
}

export default function Header() {
    const { vars } = useThemes()
    const { products } = useProductsListStore()
    const { onlineRecipes } = useRecipesStore()
    const { found } = useProductsSearchStore()

    const totalProducts = products ? Object.keys(products).length : 0

    const currentRouteName = useNavigationState((state) => {
        const route = state.routes[state.index]
        return route.name
    })

    const headerTitle =
        ROUTE_TITLES[currentRouteName] ?? currentRouteName.charAt(0).toUpperCase() + currentRouteName.slice(1)

    const getCustomHeaderTitle = (title: string) => {
        if (title === "online-recipes") {
            if (onlineRecipes === 0) {
                return <Text style={{ fontWeight: "600", fontSize: 16, color: vars.textColor }}>Search Recipes</Text>
            }
            return (
                <Text style={{ fontWeight: "600", fontSize: 16, color: vars.textColor }}>{onlineRecipes} Recipes</Text>
            )
        } else if (title === "search") {
            if (found === 0) {
                return <Text style={{ fontWeight: "600", fontSize: 16, color: vars.textColor }}>Search Products</Text>
            }

            return <Text style={{ fontWeight: "600", fontSize: 16, color: vars.textColor }}>{found} Products</Text>
        }

        return <Text style={{ fontWeight: "600", fontSize: 16, color: vars.textColor }}>{headerTitle}</Text>
    }

    return (
        <View style={{ alignItems: "center" }}>
            {products === null ? (
                <ActivityIndicator size="small" color={vars.textColor} />
            ) : currentRouteName !== "index" ? (
                getCustomHeaderTitle(currentRouteName)
            ) : totalProducts > 0 ? (
                <ListHeader />
            ) : (
                <Text style={{ fontWeight: "600", fontSize: 16, color: vars.textColor }}>No products yet</Text>
            )}
        </View>
    )
}
