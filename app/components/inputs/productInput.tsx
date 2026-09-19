import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Image, StyleSheet, TextInput, View } from "react-native"
import { PressableScale } from "pressto"
import * as ImagePicker from "expo-image-picker"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { useSharedValue, withTiming } from "react-native-reanimated"
import { X } from "lucide-react-native"
import { useProductsList } from "@/hooks/products-list/useProductsList"
import ImageInput from "@/components/inputs/imageInput"
import useThemes from "@/hooks/themes/useThemes"
import { GlassView } from "expo-glass-effect"
import Svg, { Path } from "react-native-svg"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    onFocus: () => void
    onBlur: () => void
}

export default function ProductInput({ onFocus, onBlur }: Props) {
    const { vars } = useThemes()
    const { theme, aColorUse } = useSettingsStore()
    const { actions, states } = useProductsList()

    const inputRef = useRef<TextInput>(null)

    const previewHeight = useSharedValue(0)

    const [productName, setProductName] = useState("")
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<ImagePicker.ImagePickerAsset | null>(null)

    const removeImage = () => {
        setPreviewUrl(null)
        setImageFile(null)
    }

    const onPickFile = (uri: string, image: ImagePicker.ImagePickerAsset) => {
        setPreviewUrl(uri)
        setImageFile(image)
    }

    const createProduct = async () => {
        await actions.createProduct(productName, previewUrl, imageFile)

        setProductName("")
        setPreviewUrl(null)
        setImageFile(null)
    }

    useEffect(() => {
        previewHeight.value = withTiming(previewUrl ? 80 : 0, {
            duration: 200,
        })
    }, [previewUrl])

    const isReady = Boolean(productName || previewUrl)
    const usesAccent = aColorUse.input

    const focusInput = () => {
        onFocus?.()
        inputRef.current?.focus()
    }

    return (
        <View style={styles.container}>
            <GlassView
                onTouchStart={focusInput}
                style={styles.glassView}
                glassEffectStyle="regular"
                isInteractive
                colorScheme={theme === "light" ? "light" : "dark"}
                tintColor={vars.secondaryBackgroundColor}
            >
                {previewUrl && (
                    <View style={styles.previewWrapper}>
                        <Image source={{ uri: previewUrl }} resizeMode="cover" style={styles.previewImage} />

                        <GlassView
                            style={styles.closeButtonGlass}
                            glassEffectStyle="regular"
                            isInteractive
                            colorScheme={theme === "light" ? "light" : "dark"}
                        >
                            <PressableScale onPress={removeImage} style={styles.closeButton}>
                                <X size={16} strokeWidth={2.5} color={vars.textColor} />
                            </PressableScale>
                        </GlassView>
                    </View>
                )}

                <View style={styles.inputRow}>
                    <TextInput
                        onFocus={onFocus}
                        onBlur={onBlur}
                        ref={inputRef}
                        keyboardAppearance={theme === "light" ? "light" : "dark"}
                        placeholder="Type here..."
                        placeholderTextColor="#999"
                        value={productName}
                        onChangeText={setProductName}
                        returnKeyType="done"
                        style={[
                            styles.textInput,
                            {
                                color: vars.textColor,
                            },
                        ]}
                    />
                </View>

                <View style={styles.pillRow}>
                    <View style={styles.imageInputWrapper}>
                        <ImageInput type="list" onPick={onPickFile} />
                    </View>

                    <View style={styles.sendWrapper}>
                        {isReady && (
                            <PressableScale
                                onPress={createProduct}
                                style={[
                                    styles.sendButton,
                                    {
                                        backgroundColor: usesAccent ? vars.accentColor : vars.secondaryBorderColor,
                                    },
                                ]}
                            >
                                {states.loading ? (
                                    <ActivityIndicator size="small" color={usesAccent ? "#fff" : vars.textColor} />
                                ) : (
                                    <Svg width={20} height={20} viewBox="0 -0.5 25 25" fill="none">
                                        <Path
                                            d="M18.455 9.8834L7.063 4.1434C6.76535 3.96928 6.40109 3.95274 6.08888 4.09916C5.77667 4.24558 5.55647 4.53621 5.5 4.8764C5.5039 4.98942 5.53114 5.10041 5.58 5.2024L7.749 10.4424C7.85786 10.7903 7.91711 11.1519 7.925 11.5164C7.91714 11.8809 7.85789 12.2425 7.749 12.5904L5.58 17.8304C5.53114 17.9324 5.5039 18.0434 5.5 18.1564C5.55687 18.4961 5.77703 18.7862 6.0889 18.9323C6.40078 19.0785 6.76456 19.062 7.062 18.8884L18.455 13.1484C19.0903 12.8533 19.4967 12.2164 19.4967 11.5159C19.4967 10.8154 19.0903 10.1785 18.455 9.8834V9.8834Z"
                                            stroke={usesAccent ? "#fff" : vars.textColor}
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </Svg>
                                )}
                            </PressableScale>
                        )}
                    </View>
                </View>
            </GlassView>
        </View>
    )
}

const styles = StyleSheet.create({
    inputContent: {
        width: "100%",
    },
    container: {
        paddingBottom: 40,
        paddingHorizontal: 10,
    },
    pressableContainer: {
        width: "100%",
    },
    glassView: {
        borderRadius: BORDER_RADIUS_L,
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 14,
        overflow: "hidden",
    },
    previewWrapper: {
        position: "relative",
        width: 88,
        height: 88,
        marginBottom: 14,
    },
    previewImage: {
        width: "100%",
        height: "100%",
        borderRadius: BORDER_RADIUS_M,
    },
    closeButtonGlass: {
        position: "absolute",
        top: -6,
        right: -6,
        width: 30,
        height: 30,
        borderRadius: BORDER_RADIUS_FULL,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    closeButton: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
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
        paddingVertical: 8,
        fontSize: 16,
        fontWeight: "400",
    },
    pillRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
    },
    imageInputWrapper: {
        width: 42,
        height: 42,
        borderRadius: BORDER_RADIUS_FULL,
        alignItems: "center",
        justifyContent: "center",
    },
    sendWrapper: {
        height: 42,
        justifyContent: "center",
    },
    sendButton: {
        height: 42,
        minWidth: 56,
        paddingHorizontal: 16,
        borderRadius: BORDER_RADIUS_FULL,
        alignItems: "center",
        justifyContent: "center",
    },
})
