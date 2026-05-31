import { ActivityIndicator, StyleSheet, TextInput, View } from "react-native"
import Svg, { Path } from "react-native-svg"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    createCronProduct: () => void
    setProduct: (product: string) => void
    product: string
    loading: boolean
}

export default function Input({ createCronProduct, setProduct, product, loading }: Props) {
    const { vars, theme } = useThemes()
    const { aColorUse } = useSettingsStore()

    return (
        <View style={styles.container}>
            <GlassOrBlurView
                style={[styles.innerContainer]}
                backgroundColor={vars.secondaryBackgroundColor}
                borderColor={vars.secondaryBackgroundColor}
            >
                <View style={styles.inputRow}>
                    <TextInput
                        keyboardAppearance={theme === "light" ? "light" : "dark"}
                        placeholder="Type here..."
                        placeholderTextColor="#aaa"
                        value={product}
                        onChangeText={setProduct}
                        style={[styles.textInput, { color: vars.textColor }]}
                    />
                </View>

                <View style={styles.pillRow}>
                    <View style={styles.sendWrapper}>
                        {product && (
                            <PressableScale
                                onPress={createCronProduct}
                                style={[
                                    styles.sendButton,
                                    {
                                        backgroundColor: aColorUse.input ? vars.accentColor : vars.secondaryBorderColor,
                                        borderColor: aColorUse.input
                                            ? `${vars.accentColor}50`
                                            : `${vars.secondaryBackgroundColor}50`,
                                    },
                                ]}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color={vars.textColor} />
                                ) : (
                                    <Svg width="20px" height="20px" viewBox="0 -0.5 25 25" fill="none">
                                        <Path
                                            d="M18.455 9.8834L7.063 4.1434C6.76535 3.96928 6.40109 3.95274 6.08888 4.09916C5.77667 4.24558 5.55647 4.53621 5.5 4.8764C5.5039 4.98942 5.53114 5.10041 5.58 5.2024L7.749 10.4424C7.85786 10.7903 7.91711 11.1519 7.925 11.5164C7.91714 11.8809 7.85789 12.2425 7.749 12.5904L5.58 17.8304C5.53114 17.9324 5.5039 18.0434 5.5 18.1564C5.55687 18.4961 5.77703 18.7862 6.0889 18.9323C6.40078 19.0785 6.76456 19.062 7.062 18.8884L18.455 13.1484C19.0903 12.8533 19.4967 12.2164 19.4967 11.5159C19.4967 10.8154 19.0903 10.1785 18.455 9.8834V9.8834Z"
                                            stroke={aColorUse.input ? "#fff" : vars.textColor}
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </Svg>
                                )}
                            </PressableScale>
                        )}
                    </View>
                </View>
            </GlassOrBlurView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
        paddingHorizontal: 10,
    },
    innerContainer: {
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 14,
    },
    previewWrapper: {
        marginBottom: 14,
        position: "relative",
        width: 88,
        height: 88,
    },
    previewImage: {
        width: "100%",
        height: "100%",
        borderRadius: 20,
    },
    closeButton: {
        position: "absolute",
        top: 8,
        right: 8,
        borderRadius: 50,
        padding: 4,
        backgroundColor: "rgba(255,255,255,0.8)",
    },
    closeButtonGlass: {
        position: "absolute",
        top: -6,
        right: -6,
        width: 28,
        height: 28,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 4,
        minHeight: 44,
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        fontSize: 16,
    },
    pillRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 12,
    },
    imageInputWrapper: {
        height: 42,
        width: 42,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    sendWrapper: { height: 40, justifyContent: "center" },
    sendButton: {
        borderRadius: 999,
        height: 42,
        minWidth: 56,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
    },
    inputContext: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
    },
    editContent: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
    },
    modalInput: {
        padding: 8,
        fontSize: 18,
    },
    sendButtonModal: { marginTop: 23, alignSelf: "flex-end" },
    closeButtonModal: { alignSelf: "flex-start" },
    closeEditButton: {
        borderRadius: 9999,
        height: 40,
        paddingHorizontal: 8,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
})
