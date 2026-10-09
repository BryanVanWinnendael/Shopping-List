import { ActivityIndicator, StyleSheet, TextInput, View } from "react-native"
import { SendIcon } from "lucide-react-native"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, COMPOSER_MIN_HEIGHT, COMPOSER_SEND_SIZE, DOCK_BOTTOM } from "@/lib/theme"

type Props = {
    createCronProduct: () => void
    setProduct: (product: string) => void
    product: string
    loading: boolean
}

export default function Input({ createCronProduct, setProduct, product, loading }: Props) {
    const { vars, appearance } = useThemes()

    const isReady = Boolean(product)

    return (
        <View style={styles.container}>
            <LiquidGlassView style={styles.glassView} isInteractive>
                <View style={styles.inputRow}>
                    <TextInput
                        keyboardAppearance={appearance}
                        placeholder="Type here..."
                        placeholderTextColor="#999"
                        value={product}
                        onChangeText={setProduct}
                        style={[
                            styles.textInput,
                            {
                                color: vars.textColor,
                            },
                        ]}
                        returnKeyType="done"
                        onSubmitEditing={() => {
                            if (product) {
                                createCronProduct()
                            }
                        }}
                    />

                    <View style={styles.sendWrapper}>
                        <PressableScale
                            onPress={createCronProduct}
                            enabled={isReady && !loading}
                            style={[
                                styles.sendButton,
                                {
                                    backgroundColor: vars.accentColor,
                                    opacity: !isReady || loading ? 0.35 : 1,
                                },
                            ]}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <SendIcon size={16} color="#fff" />
                            )}
                        </PressableScale>
                    </View>
                </View>
            </LiquidGlassView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingBottom: DOCK_BOTTOM,
    },
    glassView: {
        minHeight: COMPOSER_MIN_HEIGHT,
        maxHeight: 120,
        borderRadius: BORDER_RADIUS_L,
        borderWidth: 1,
        paddingLeft: 16,
        paddingRight: 6,
        paddingVertical: 4,
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
        minHeight: 36,
    },
    textInput: {
        flex: 1,
        minHeight: 34,
        maxHeight: 100,
        paddingVertical: 7,
        paddingHorizontal: 2,
        fontSize: 16,
        fontWeight: "400",
    },
    sendWrapper: {
        width: COMPOSER_SEND_SIZE,
        height: COMPOSER_SEND_SIZE,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 6,
    },
    sendButton: {
        width: COMPOSER_SEND_SIZE,
        height: COMPOSER_SEND_SIZE,
        borderRadius: BORDER_RADIUS_FULL,
        alignItems: "center",
        justifyContent: "center",
    },
})
