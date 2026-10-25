import { StyleSheet } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { LinearGradient } from "expo-linear-gradient"
import { usePathname } from "expo-router"

export default function GradientBackground() {
    const { aColor, aColorUse } = useSettingsStore()
    const pathname = usePathname()

    const inRecipeDetail = /^\/recipes\/[^/]+$/.test(pathname) || /^\/online-recipes\/[^/]+$/.test(pathname)

    if (!aColorUse.header || inRecipeDetail) return null

    return (
        <LinearGradient
            colors={[aColor + "AA", aColor + "44", aColor + "00"]}
            style={styles.topGradient}
            pointerEvents="none"
        />
    )
}

const styles = StyleSheet.create({
    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 110,
        zIndex: 1,
    },
})
