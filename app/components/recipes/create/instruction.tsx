import { StyleSheet, Text, TextInput, View } from "react-native"
import { PressableScale } from "pressto"
import { X } from "lucide-react-native"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"
import LiquidGlassView from "@/components/native/liquidGlassView"

type Props = {
    instruction: string
    index: number
    onUpdate: (index: number, value: string) => void
    onRemove: (index: number) => void
}

export default function Instruction({ instruction, index, onUpdate, onRemove }: Props) {
    const { vars, appearance } = useThemes()

    return (
        <LiquidGlassView style={styles.card}>
            <View style={styles.side}>
                <View style={[styles.badge, { backgroundColor: vars.backgroundColor }]}>
                    <Text style={[styles.badgeText, { color: vars.textColor }]}>{index + 1}</Text>
                </View>
            </View>

            <TextInput
                value={instruction}
                onChangeText={(text) => onUpdate(index, text)}
                placeholder={`Step ${index + 1}`}
                placeholderTextColor={vars.tertiaryTextColor}
                multiline
                textAlignVertical="top"
                scrollEnabled
                keyboardAppearance={appearance}
                style={[
                    styles.input,
                    {
                        backgroundColor: vars.backgroundColor,
                        borderColor: vars.borderColor,
                        color: vars.textColor,
                    },
                ]}
            />

            <View style={styles.side}>
                <PressableScale onPress={() => onRemove(index)} style={styles.removeButton}>
                    <X size={15} color={vars.textColor} strokeWidth={2} />
                </PressableScale>
            </View>
        </LiquidGlassView>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS_L,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    side: {
        width: 30,
        height: 46,
        justifyContent: "center",
        alignItems: "center",
    },
    badge: {
        width: 28,
        height: 28,
        borderRadius: BORDER_RADIUS_FULL,
        justifyContent: "center",
        alignItems: "center",
    },
    badgeText: {
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
    },
    input: {
        flex: 1,
        minHeight: 46,
        maxHeight: 120,
        paddingHorizontal: 13,
        paddingVertical: 11,
        borderRadius: BORDER_RADIUS_M,
        borderWidth: 1,
        fontSize: 15,
        lineHeight: 21,
    },
    removeButton: {
        width: 28,
        height: 28,
        borderRadius: BORDER_RADIUS_FULL,
        justifyContent: "center",
        alignItems: "center",
    },
})
