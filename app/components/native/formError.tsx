import { StyleSheet, Text } from "react-native"
import { PressableScale } from "pressto"
import { X, XCircle } from "lucide-react-native"

import useThemes from "@/hooks/themes/useThemes"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { BORDER_RADIUS_L } from "@/lib/theme"

type Props = {
    message: string | null
    onDismiss: () => void
}

export default function FormError({ message, onDismiss }: Props) {
    const { vars, appearance } = useThemes()

    if (!message) return null

    return (
        <LiquidGlassView
            isInteractive={false}
            tintColor={appearance === "light" ? "rgba(239,68,68,0.25)" : undefined}
            style={styles.banner}
        >
            <XCircle size={18} color="#ef4444" />
            <Text style={[styles.text, { color: vars.textColor }]} numberOfLines={3}>
                {message}
            </Text>
            <PressableScale
                onPress={onDismiss}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Dismiss error"
                style={styles.dismiss}
            >
                <X size={16} color={vars.secondaryTextColor} />
            </PressableScale>
        </LiquidGlassView>
    )
}

const styles = StyleSheet.create({
    banner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: BORDER_RADIUS_L,
        borderWidth: 1,
        borderColor: "rgba(239,68,68,0.45)",
        backgroundColor: "rgba(239,68,68,0.12)",
        overflow: "hidden",
        marginBottom: 10,
    },
    text: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
    },
    dismiss: {
        padding: 4,
    },
})
