import { ActivityIndicator, StyleSheet, View } from "react-native"
import { PressableScale } from "pressto"
import { GlassView } from "expo-glass-effect"
import { Trash } from "lucide-react-native"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    clearLogs: () => void
    loading: boolean
}

export default function ClearButton({ clearLogs, loading }: Props) {
    const { vars, appearance } = useThemes()

    return (
        <View style={styles.container}>
            <GlassView
                glassEffectStyle="regular"
                isInteractive={!loading}
                colorScheme={appearance}
                style={styles.glass}
            >
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
                        <Trash size={20} color={vars.textColor} />
                    )}
                </PressableScale>
            </GlassView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 24,
        right: 24,
        zIndex: 1,
    },
    glass: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
    },
    button: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },
})
