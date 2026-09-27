import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { PressableScale } from "pressto"
import { SaveFormat, useImageManipulator } from "expo-image-manipulator"
import { useEffect, useRef, useState } from "react"
import useThemes from "@/hooks/themes/useThemes"
import { type CameraType, CameraView, useCameraPermissions } from "expo-camera"
import { Camera, ImagePlus, RotateCcw, X } from "lucide-react-native"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"
import { GlassView } from "expo-glass-effect"

type Props = {
    onPick: (uri: string, image: ImagePicker.ImagePickerAsset) => void
    type: "list" | "recipe"
    onFocus?: () => void
    onBlur?: () => void
}

const FIFTEEN_MB = 15 * 1024 * 1024

export default function ImageInput({ onPick, type, onFocus = () => {}, onBlur = () => {} }: Props) {
    const { vars, appearance, theme } = useThemes()

    const [permission, requestPermission] = useCameraPermissions()

    const [pickedUri, setPickedUri] = useState<string | null>(null)
    const [menuVisible, setMenuVisible] = useState(false)
    const [cameraVisible, setCameraVisible] = useState(false)
    const [facing, setFacing] = useState<CameraType>("back")

    const cameraRef = useRef<CameraView>(null)

    /*
     * Only animate scale.
     *
     * Do NOT animate opacity on a parent of GlassView.
     */
    const menuScale = useRef(new Animated.Value(0.82)).current

    const manipulator = useImageManipulator(pickedUri ?? "")

    const openMenu = () => {
        onFocus()

        setMenuVisible(true)

        menuScale.setValue(0.82)

        requestAnimationFrame(() => {
            Animated.spring(menuScale, {
                toValue: 1,
                friction: 8,
                tension: 110,
                useNativeDriver: true,
            }).start()
        })
    }

    const closeMenu = () => {
        onBlur()

        Animated.timing(menuScale, {
            toValue: 0.96,
            duration: 70,
            useNativeDriver: true,
        }).start(() => {
            setMenuVisible(false)
        })
    }

    const pickImageLibrary = async () => {
        closeMenu()

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
        })

        if (!result.canceled) {
            const asset = result.assets[0]

            setPickedUri(asset.uri)
        }
    }

    const openCamera = async () => {
        closeMenu()

        if (!permission?.granted) {
            const result = await requestPermission()

            if (!result.granted) {
                return
            }
        }

        setCameraVisible(true)
    }

    const takePhoto = async () => {
        if (!cameraRef.current) return

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 1,
            })

            if (!photo?.uri) return

            setCameraVisible(false)
            setPickedUri(photo.uri)
        } catch (error) {
            console.error("Failed to take photo:", error)
        }
    }

    const flipCamera = () => {
        setFacing((current) => (current === "back" ? "front" : "back"))
    }

    useEffect(() => {
        if (!manipulator || !pickedUri) return

        let cancelled = false

        const processImage = async () => {
            try {
                const rendered = await manipulator.renderAsync()

                if (cancelled) return

                const fileSize = (rendered as any).fileSize ?? 0

                let compress = 0.6

                if (fileSize > FIFTEEN_MB) {
                    compress = 0.3
                }

                const saved = await rendered.saveAsync({
                    compress,
                    format: SaveFormat.JPEG,
                })

                if (cancelled) return

                onPick(saved.uri, saved)
            } catch (error) {
                console.error("Failed to process image:", error)
            }
        }

        processImage()

        return () => {
            cancelled = true
        }
    }, [manipulator, pickedUri])

    const renderMenu = () => (
        <>
            {menuVisible && (
                <>
                    <Pressable onPress={closeMenu} style={styles.menuBackdrop} />

                    <Animated.View
                        style={[
                            styles.menuWrapper,
                            type === "recipe" && styles.recipeMenuWrapper,
                            {
                                transform: [
                                    {
                                        scale: menuScale,
                                    },
                                ],
                            },
                        ]}
                    >
                        <GlassView
                            key={theme}
                            style={styles.menu}
                            glassEffectStyle="regular"
                            isInteractive
                            colorScheme={appearance}
                        >
                            <PressableScale onPress={openCamera} style={styles.menuItem}>
                                <View
                                    style={[
                                        styles.menuIcon,
                                        {
                                            backgroundColor: vars.secondaryBackgroundColor,
                                        },
                                    ]}
                                >
                                    <Camera size={18} color={vars.textColor} strokeWidth={2} />
                                </View>

                                <Text
                                    style={[
                                        styles.menuText,
                                        {
                                            color: vars.textColor,
                                        },
                                    ]}
                                >
                                    Take Photo
                                </Text>
                            </PressableScale>

                            <PressableScale onPress={pickImageLibrary} style={styles.menuItem}>
                                <View
                                    style={[
                                        styles.menuIcon,
                                        {
                                            backgroundColor: vars.secondaryBackgroundColor,
                                        },
                                    ]}
                                >
                                    <ImagePlus size={18} color={vars.textColor} strokeWidth={2} />
                                </View>

                                <Text
                                    style={[
                                        styles.menuText,
                                        {
                                            color: vars.textColor,
                                        },
                                    ]}
                                >
                                    Choose Photo
                                </Text>
                            </PressableScale>
                        </GlassView>
                    </Animated.View>
                </>
            )}
        </>
    )

    const renderCamera = () => (
        <Modal visible={cameraVisible} transparent animationType="slide" onRequestClose={() => setCameraVisible(false)}>
            <View style={styles.cameraOverlay}>
                <View style={styles.cameraCard}>
                    <CameraView
                        ref={cameraRef}
                        style={styles.cameraPreview}
                        facing={facing}
                        mode="picture"
                        animateShutter
                    />

                    <GlassView
                        style={styles.cameraCloseGlass}
                        glassEffectStyle="regular"
                        isInteractive
                        colorScheme={appearance}
                    >
                        <PressableScale onPress={() => setCameraVisible(false)} style={styles.cameraControl}>
                            <X size={20} color="#fff" strokeWidth={2} />
                        </PressableScale>
                    </GlassView>

                    <GlassView
                        style={styles.cameraFlipGlass}
                        glassEffectStyle="regular"
                        isInteractive
                        colorScheme={appearance}
                    >
                        <PressableScale onPress={flipCamera} style={styles.cameraControl}>
                            <RotateCcw size={19} color="#fff" strokeWidth={2} />
                        </PressableScale>
                    </GlassView>

                    <View style={styles.cameraBottom}>
                        <Pressable onPress={takePhoto} style={styles.shutterOuter}>
                            <View style={styles.shutterInner} />
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )

    if (type === "list") {
        return (
            <View style={styles.listContainer}>
                <GlassView style={styles.listGlass} glassEffectStyle="regular" isInteractive colorScheme={appearance}>
                    <PressableScale onPress={openMenu} style={styles.listButton}>
                        <ImagePlus size={21} color={vars.textColor} strokeWidth={2} />
                    </PressableScale>
                </GlassView>

                {renderMenu()}
                {renderCamera()}
            </View>
        )
    }

    return (
        <>
            <PressableScale
                onPress={openMenu}
                style={{
                    marginTop: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: BORDER_RADIUS_L,
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderWidth: 1,
                    borderColor: vars.secondaryBorderColor,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                }}
            >
                <ImagePlus size={15} color={vars.textColor} strokeWidth={2} />

                <Text
                    style={{
                        color: vars.textColor,
                        fontSize: 13,
                        fontWeight: "600",
                    }}
                >
                    Add Image
                </Text>
            </PressableScale>

            {renderMenu()}
            {renderCamera()}
        </>
    )
}

const styles = StyleSheet.create({
    listContainer: {
        width: 55,
        height: 55,
        position: "relative",
        zIndex: 100,
        overflow: "visible",
    },

    listGlass: {
        width: 55,
        height: 55,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
    },

    listButton: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },

    menuWrapper: {
        position: "absolute",
        left: 0,
        bottom: 0,
        width: 250,
        transformOrigin: "bottom left",
        zIndex: 200,
    },

    recipeMenuWrapper: {
        left: 0,
        bottom: 0,
    },

    menu: {
        width: "100%",
        borderRadius: BORDER_RADIUS_L,
        padding: 6,
        overflow: "hidden",
    },

    menuItem: {
        height: 54,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        borderRadius: 18,
    },

    menuIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 11,
    },

    menuText: {
        fontSize: 16,
        fontWeight: "500",
    },

    menuBackdrop: {
        position: "absolute",
        top: -1000,
        left: -1000,
        right: -1000,
        bottom: -1000,
        zIndex: 150,
    },

    cameraOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        paddingHorizontal: 5,
        paddingVertical: 5,
    },

    cameraCard: {
        width: "100%",
        height: "70%",
        minHeight: 380,
        backgroundColor: "#000",
        borderRadius: 48,
        overflow: "hidden",
        position: "relative",
    },

    cameraPreview: {
        ...StyleSheet.absoluteFill,
    },

    cameraCloseGlass: {
        position: "absolute",
        top: 14,
        left: 14,
        width: 42,
        height: 42,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
    },

    cameraFlipGlass: {
        position: "absolute",
        top: 14,
        right: 14,
        width: 42,
        height: 42,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
    },

    cameraControl: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },

    cameraBottom: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 24,
        alignItems: "center",
        justifyContent: "center",
    },

    shutterOuter: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 4,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },

    shutterInner: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#fff",
    },
})
