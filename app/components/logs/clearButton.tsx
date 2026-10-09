import { ActivityIndicator, StyleSheet, View } from "react-native"
import { PressableScale } from "pressto"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { Trash } from "lucide-react-native"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, DOCK_BOTTOM, DOCK_SIDE, FAB_ICON_SIZE, FAB_SIZE } from "@/lib/theme"

type Props = {
    clearLogs: () => void
    loading: boolean
}

export default function ClearButton({ clearLogs, loading }: Props) {
    const { vars } = useThemes()

    return (
        <View style={styles.container}>
            <LiquidGlassView isInteractive={!loading} style={styles.glass}>
                <PressableScale
                    enabled={!loading}
                    onPress={clearLogs}
                    accessibilityRole="button"
                    accessibilityLabel="Clear logs"
                    accessibilityState={{ busy: loading, disabled: loading }}
                    style={styles.button}
                >
                    {loading ? (
                        <ActivityIndicator color={vars.textColor} />
                    ) : (
                        <Trash size={FAB_ICON_SIZE} color={vars.textColor} />
                    )}
                </PressableScale>
            </LiquidGlassView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: DOCK_BOTTOM,
        right: DOCK_SIDE,
        zIndex: 1,
    },
    glass: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    button: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
})
