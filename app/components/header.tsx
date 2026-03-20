import { View, Text, ActivityIndicator } from "react-native"
import { useSettings } from "@/stores/useSettings"
import { useNavigationState } from "@react-navigation/native"
import { getTextColor } from "@/lib/theme"
import { useInteractions } from "@/stores/useInteractions"
import { ErrorBanner } from "./errorBanner"
import { ListHeader } from "./listHeader"

const ROUTE_TITLES: Record<string, string> = {
  weeklyCategories: "Weekly Categories",
  weekly: "Weekly List",
}

export function Header() {
  const { theme } = useSettings()
  const { error, items } = useInteractions()

  const textColor = getTextColor(theme)

  const totalItems = items ? Object.keys(items).length : 0

  const currentRouteName = useNavigationState((state) => {
    const route = state.routes[state.index]
    return route.name
  })

  const headerTitle =
    ROUTE_TITLES[currentRouteName] ??
    currentRouteName.charAt(0).toUpperCase() + currentRouteName.slice(1)

  return (
    <View style={{ alignItems: "center" }}>
      {error ? (
        <ErrorBanner message={error} />
      ) : items === null ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : currentRouteName !== "index" ? (
        <Text style={{ fontWeight: "600", fontSize: 16, color: textColor }}>
          {headerTitle}
        </Text>
      ) : totalItems > 0 ? (
        <ListHeader />
      ) : (
        <Text style={{ fontWeight: "600", fontSize: 16, color: textColor }}>
          No items yet
        </Text>
      )}
    </View>
  )
}
