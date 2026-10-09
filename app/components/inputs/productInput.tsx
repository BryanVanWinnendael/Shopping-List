import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Image, StyleSheet, TextInput, View } from "react-native"
import { PressableScale } from "pressto"
import * as ImagePicker from "expo-image-picker"
import { useSharedValue, withTiming } from "react-native-reanimated"
import { SendIcon, X } from "lucide-react-native"
import { useProductsList } from "@/hooks/products-list/useProductsList"
import ImageInput from "@/components/inputs/imageInput"
import useThemes from "@/hooks/themes/useThemes"
import LiquidGlassView from "@/components/native/liquidGlassView"
import {
    BORDER_RADIUS_FULL,
    BORDER_RADIUS_L,
    COMPOSER_MIN_HEIGHT,
    COMPOSER_SEND_SIZE,
    DOCK_BOTTOM,
    FAB_SIZE,
} from "@/lib/theme"

type Props = {
    onFocus: () => void
    onBlur: () => void
}

export default function ProductInput({ onFocus, onBlur }: Props) {
    const { vars, appearance } = useThemes()
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

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                {previewUrl ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: previewUrl }} resizeMode="cover" style={styles.previewImage} />

                        <LiquidGlassView style={styles.closeButtonGlass} isInteractive>
                            <PressableScale onPress={removeImage} style={styles.closeButton}>
                                <X size={15} strokeWidth={2.5} color={vars.textColor} />
                            </PressableScale>
                        </LiquidGlassView>
                    </View>
                ) : (
                    <ImageInput type="list" onPick={onPickFile} onFocus={onFocus} onBlur={onBlur} />
                )}
            </View>

            <LiquidGlassView style={styles.glassView} isInteractive>
                <View style={styles.inputRow}>
                    <TextInput
                        onFocus={onFocus}
                        onBlur={onBlur}
                        ref={inputRef}
                        keyboardAppearance={appearance}
                        placeholder="Type here..."
                        placeholderTextColor={vars.tertiaryTextColor}
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

                    <View style={styles.sendWrapper}>
                        <PressableScale
                            onPress={createProduct}
                            enabled={isReady && !states.loading}
                            style={[
                                styles.sendButton,
                                {
                                    backgroundColor: vars.accentColor,
                                    opacity: !isReady || states.loading ? 0.35 : 1,
                                },
                            ]}
                        >
                            {states.loading ? (
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
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingBottom: DOCK_BOTTOM,
        gap: 8,
    },
    imageContainer: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        position: "relative",
        zIndex: 100,
        overflow: "visible",
    },
    previewContainer: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: BORDER_RADIUS_L,
        overflow: "visible",
        position: "relative",
    },
    previewImage: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: BORDER_RADIUS_L,
    },
    closeButtonGlass: {
        position: "absolute",
        top: -6,
        right: -6,
        width: 25,
        height: 25,
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
    glassView: {
        flex: 1,
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
