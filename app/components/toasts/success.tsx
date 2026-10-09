import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { CheckCircle2 } from "lucide-react-native"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    text1?: string
    text2?: string
}

export default function Success({ text1, text2 }: Props) {
    const { vars, appearance } = useThemes()

    const isLoading = text1 && text1.includes("...")
    const isLight = appearance === "light"

    return (
        <LiquidGlassView
            isInteractive={false}
            tintColor={isLight ? (isLoading ? "rgba(30,85,252,0.28)" : "rgba(34,197,94,0.28)") : undefined}
            style={[styles.container, { borderColor: isLoading ? `${vars.accentColor}59` : "rgba(34,197,94,0.45)" }]}
        >
            <View
                style={[
                    styles.iconWrap,
                    { backgroundColor: isLoading ? `${vars.accentColor}26` : "rgba(34,197,94,0.16)" },
                ]}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={vars.accentColor} />
                ) : (
                    <CheckCircle2 size={18} color="#22c55e" />
                )}
            </View>
            <View style={styles.textWrap}>
                <Text style={[styles.title, { color: vars.textColor }]} numberOfLines={1}>
                    {text1}
                </Text>
                {!!text2 && (
                    <Text style={[styles.subtitle, { color: vars.secondaryTextColor }]} numberOfLines={2}>
                        {text2}
                    </Text>
                )}
            </View>
        </LiquidGlassView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        paddingRight: 18,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
        borderWidth: 1,
        alignSelf: "center",
        maxWidth: "92%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    iconWrap: {
        width: 30,
        height: 30,
        borderRadius: BORDER_RADIUS_FULL,
        alignItems: "center",
        justifyContent: "center",
    },
    textWrap: {
        flexShrink: 1,
    },
    title: {
        fontWeight: "600",
        fontSize: 14,
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
})
