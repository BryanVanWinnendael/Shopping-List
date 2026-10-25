import { PressableScale } from "pressto"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { ChevronLeft } from "lucide-react-native"
import { router } from "expo-router"
import { StyleSheet } from "react-native"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, FAB_ICON_SIZE, FAB_SIZE } from "@/lib/theme"

export default function BackButton() {
    const { vars } = useThemes()

    return (
        <PressableScale onPress={() => router.back()} style={styles.button}>
            <LiquidGlassView style={styles.glass} isInteractive>
                <ChevronLeft size={FAB_ICON_SIZE} color={vars.textColor} style={styles.icon} />
            </LiquidGlassView>
        </PressableScale>
    )
}

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
        width: FAB_SIZE,
        height: FAB_SIZE,
    },
    glass: {
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        width: FAB_SIZE,
        height: FAB_SIZE,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    icon: {
        marginRight: 2,
    },
})
