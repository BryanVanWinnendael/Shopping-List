import { useState } from "react"
import { StyleSheet, TextInput, View } from "react-native"
import { PressableScale } from "pressto"
import { GlassView } from "expo-glass-effect"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"
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
            <GlassView style={styles.glassView} glassEffectStyle="regular" isInteractive colorScheme={appearance}>
                <View style={styles.inputRow}>
                    <TextInput
                        autoFocus
                        value={text}
                        onChangeText={handleChange}
                        placeholder="Edit product..."
                        placeholderTextColor="#999"
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
                        <SendIcon size={20} color="#fff" />
                    </PressableScale>
                </View>
            </GlassView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingBottom: 16,
    },
    glassView: {
        flex: 1,
        minHeight: 58,
        maxHeight: 130,
        borderRadius: BORDER_RADIUS_L,
        paddingLeft: 16,
        paddingRight: 6,
        paddingVertical: 6,
        overflow: "hidden",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        minHeight: 44,
    },
    textInput: {
        flex: 1,
        minHeight: 42,
        maxHeight: 100,
        paddingVertical: 9,
        paddingHorizontal: 2,
        fontSize: 16,
        fontWeight: "400",
    },
    sendButton: {
        width: 42,
        height: 42,
        marginLeft: 6,
        borderRadius: BORDER_RADIUS_FULL,
        alignItems: "center",
        justifyContent: "center",
    },
})
