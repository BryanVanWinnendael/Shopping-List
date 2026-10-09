import { StyleSheet, Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { XCircle } from "lucide-react-native"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    text1?: string
    text2?: string
}

export default function Error({ text1, text2 }: Props) {
    const { vars, appearance } = useThemes()

    const isLight = appearance === "light"

    return (
        <LiquidGlassView
            isInteractive={false}
            tintColor={isLight ? "rgba(239,68,68,0.28)" : undefined}
            style={[styles.container, { borderColor: "rgba(239,68,68,0.45)" }]}
        >
            <View style={styles.iconWrap}>
                <XCircle size={18} color="#ef4444" />
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
        backgroundColor: "rgba(239,68,68,0.16)",
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
