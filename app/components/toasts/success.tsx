import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import { BlurView } from "expo-blur"
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
            intensity={70}
            tint={appearance}
            style={[styles.container, { backgroundColor: vars.backgroundColor, borderColor: vars.borderColor }]}
        >
            <View
                style={[
                    styles.iconWrap,
                    { backgroundColor: isLoading ? `${vars.accentColor}20` : "rgba(34, 197, 94, 0.15)" },
                ]}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={vars.accentColor} />
                ) : (
                    <CheckCircle2 size={16} color="#22c55e" />
                )}
            </View>
            <View style={styles.textWrap}>
                <Text style={[styles.title, { color: vars.textColor }]} numberOfLines={1}>
                    {text1}
                </Text>
                {!!text2 && (
                    <Text style={[styles.subtitle, { color: vars.textColor }]} numberOfLines={2}>
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
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
        borderWidth: 1,
        alignSelf: "center",
    },
    iconWrap: {
        width: 28,
        height: 28,
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
