import { useState } from "react"
import { StyleSheet, TextInput, View } from "react-native"
import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import LiquidGlassView from "@/components/native/liquidGlassView"
import {
    BAR_FONT_SIZE,
    BAR_PADDING_H,
    BORDER_RADIUS_FULL,
    BORDER_RADIUS_L,
    COMPOSER_MIN_HEIGHT,
    COMPOSER_SEND_SIZE,
    DOCK_SIDE,
} from "@/lib/theme"
import { Product } from "@/types/list"
import { SendIcon } from "lucide-react-native"

type Props = {
    product: Product | null
    value: string
    updateName: (value: string) => void
    updateProduct: () => void
}

export default function ProductInput({ product, value, updateName, updateProduct }: Props) {
    const { vars, appearance } = useThemes()

    // Start from the edited value or the product name, then let the user change it freely (including clearing it).
    const [text, setText] = useState(value || product?.name || "")

    const handleChange = (next: string) => {
        setText(next)
        updateName(next)
    }

    return (
        <View style={styles.container}>
            <LiquidGlassView style={styles.glassView} isInteractive>
                <View style={styles.inputRow}>
                    <TextInput
                        autoFocus
                        value={text}
                        onChangeText={handleChange}
                        placeholder="Edit product..."
                        placeholderTextColor={vars.tertiaryTextColor}
                        keyboardAppearance={appearance}
                        returnKeyType="done"
                        onSubmitEditing={updateProduct}
                        style={[styles.textInput, { color: vars.textColor }]}
                    />

                    <PressableScale
                        onPress={updateProduct}
                        accessibilityRole="button"
                        accessibilityLabel="Save product"
                        style={[styles.sendButton, { backgroundColor: vars.accentColor }]}
                    >
                        <SendIcon size={16} color="#fff" />
                    </PressableScale>
                </View>
            </LiquidGlassView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: DOCK_SIDE,
        paddingBottom: 16,
    },
    glassView: {
        flex: 1,
        minHeight: COMPOSER_MIN_HEIGHT,
        maxHeight: 120,
        borderRadius: BORDER_RADIUS_L,
        borderWidth: 1,
        paddingLeft: BAR_PADDING_H,
        paddingRight: 8,
        paddingVertical: 4,
        justifyContent: "center",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        minHeight: 40,
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 110,
        paddingVertical: 8,
        paddingHorizontal: 2,
        fontSize: BAR_FONT_SIZE,
        fontWeight: "400",
    },
    sendButton: {
        width: COMPOSER_SEND_SIZE,
        height: COMPOSER_SEND_SIZE,
        marginLeft: 8,
        borderRadius: BORDER_RADIUS_FULL,
        alignItems: "center",
        justifyContent: "center",
    },
})
