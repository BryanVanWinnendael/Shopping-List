import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { BlurView } from "expo-blur"
import useThemes from "@/hooks/themes/useThemes"
import { CheckCircle2 } from "lucide-react-native"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    text1?: string
    text2?: string
}

export default function Success({ text1, text2 }: Props) {
    const { vars, appearance } = useThemes()

    const isLoading = text1 && text1.includes("...")

    return (
        <BlurView
            intensity={60}
            tint={appearance}
            style={[
                styles.container,
                {
                    backgroundColor: appearance === "light" ? "rgba(255,255,255,0.85)" : "rgba(24,24,24,0.85)",
                    borderColor: vars.secondaryBorderColor,
                },
            ]}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color={vars.accentColor} />
            ) : (
                <CheckCircle2 size={16} color="#22c55e" />
            )}
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
        </BlurView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
        borderWidth: 1,
        alignSelf: "center",
        maxWidth: "92%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    textWrap: {
        flexShrink: 1,
    },
    title: {
        fontWeight: "600",
        fontSize: 13,
    },
    subtitle: {
        fontSize: 12,
        marginTop: 1,
    },
})
