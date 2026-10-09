import { StyleSheet, Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import { BlurView } from "expo-blur"
import { XCircle } from "lucide-react-native"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    text1?: string
    text2?: string
}

export default function Error({ text1, text2 }: Props) {
    const { vars, appearance } = useThemes()

    return (
        <BlurView
            intensity={70}
            tint={appearance}
            style={[styles.container, { backgroundColor: vars.backgroundColor, borderColor: vars.borderColor }]}
        >
            <View style={styles.iconWrap}>
                <XCircle size={16} color="#ef4444" />
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
        backgroundColor: "rgba(239, 68, 68, 0.15)",
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
