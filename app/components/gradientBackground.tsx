import { StyleSheet } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { LinearGradient } from "expo-linear-gradient"

export default function GradientBackground() {
    const { aColor, aColorUse } = useSettingsStore()

    if (!aColorUse.header) return null

    return (
        <LinearGradient
            colors={[aColor + "AA", aColor + "44", aColor + "00"]}
            style={[styles.topGradient, { height: 110 }]}
            pointerEvents="none"
        />
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    inputOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        backgroundColor: "transparent",
        justifyContent: "flex-end",
    },
})
