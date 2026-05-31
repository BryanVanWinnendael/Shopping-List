import { useState } from "react"
import { Modal, StyleSheet, Text, View } from "react-native"
import ColorPicker, { type ColorFormatsObject, HueCircular, Panel1 } from "reanimated-color-picker"
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { PressableScale } from "pressto"
import { User } from "@/types"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { X } from "lucide-react-native"

type Props = {
    user: User
}

export default function UserColor({ user }: Props) {
    const { vars, theme } = useThemes()
    const { setUserColors, userColors } = useSettingsStore()

    const currentColor = useSharedValue(vars.accentColor)
    const scale = useSharedValue(0.96)
    const opacity = useSharedValue(0)

    const [modalVisible, setModalVisible] = useState(false)
    const resetColor = theme === "light" ? "#9ca3af" : "#50555C"
    const [pickedColor, setPickedColor] = useState(userColors.colors[user] ? userColors.colors[user] : resetColor)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }))

    const onColorChange = (color: ColorFormatsObject) => {
        "worklet"
        currentColor.value = color.hex
        scale.value = withSpring(1.05)
    }

    const onColorPick = (color: ColorFormatsObject) => {
        setUserColors({
            ...userColors,
            colors: {
                ...userColors.colors,
                [user]: color.hex,
            },
        })
        setPickedColor(color.hex)
        scale.value = withSpring(1)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    const resetToDefault = () => {
        const newColors = { ...userColors.colors }

        delete newColors[user]

        setUserColors({
            ...userColors,
            colors: newColors,
        })

        setPickedColor(resetColor)
        setModalVisible(false)
    }

    const openModal = () => {
        setModalVisible(true)

        opacity.value = withTiming(1, {
            duration: 140,
            easing: Easing.out(Easing.quad),
        })

        scale.value = withSpring(1, {
            damping: 18,
            stiffness: 240,
            mass: 0.6,
        })
    }

    const closeModal = () => {
        opacity.value = withTiming(0, {
            duration: 110,
            easing: Easing.in(Easing.quad),
        })

        scale.value = withTiming(0.96, {
            duration: 110,
        })

        setTimeout(() => {
            setModalVisible(false)
        }, 110)
    }

    return (
        <View style={styles.row}>
            <Text style={[styles.title, { color: vars.textColor }]}>{user}</Text>

            <PressableScale style={[styles.button, { borderColor: vars.secondaryBorderColor }]} onPress={openModal}>
                <View
                    style={[
                        styles.colorPreview,
                        {
                            backgroundColor: userColors.colors[user] ? userColors.colors[user] : resetColor,
                        },
                    ]}
                />
                <Text style={[styles.buttonText, { color: vars.textColor }]}>Edit</Text>
            </PressableScale>

            <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
                <GlassOrBlurView style={styles.modalOverlay}>
                    <Animated.View
                        entering={FadeIn.duration(180)}
                        exiting={FadeOut.duration(120)}
                        style={[
                            styles.modalContent,
                            animatedStyle,
                            {
                                backgroundColor: vars.backgroundColor,
                                borderColor: vars.borderColor,
                            },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <View>
                                <Text
                                    style={{
                                        color: vars.textColor,
                                        fontSize: 24,
                                        fontWeight: "700",
                                    }}
                                >
                                    User Color
                                </Text>

                                <Text
                                    style={{
                                        color: theme === "light" ? "#6b7280" : "#9ca3af",
                                        marginTop: 4,
                                        fontSize: 14,
                                    }}
                                >
                                    Customize color for {user}
                                </Text>
                            </View>

                            <PressableScale
                                onPress={closeModal}
                                style={[
                                    styles.closeButton,
                                    {
                                        backgroundColor: vars.secondaryBackgroundColor,
                                        borderColor: vars.secondaryBorderColor,
                                    },
                                ]}
                            >
                                <X size={18} color={vars.textColor} />
                            </PressableScale>
                        </View>

                        <View style={{ marginTop: 24 }}>
                            <ColorPicker
                                value={pickedColor}
                                sliderThickness={20}
                                thumbSize={24}
                                onChange={onColorChange}
                                onCompleteJS={onColorPick}
                                boundedThumb
                            >
                                <HueCircular
                                    thumbShape="circle"
                                    containerStyle={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Panel1
                                        style={{
                                            borderRadius: 24,
                                            width: "70%",
                                            height: "70%",
                                            alignSelf: "center",
                                        }}
                                    />
                                </HueCircular>
                            </ColorPicker>
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                gap: 12,
                                marginTop: 24,
                            }}
                        >
                            <PressableScale
                                onPress={resetToDefault}
                                style={[
                                    styles.secondaryButton,
                                    {
                                        backgroundColor: vars.secondaryBackgroundColor,
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        color: vars.textColor,
                                        fontWeight: "600",
                                    }}
                                >
                                    Reset
                                </Text>
                            </PressableScale>

                            <PressableScale
                                onPress={closeModal}
                                style={[
                                    styles.primaryButton,
                                    {
                                        backgroundColor: vars.accentColor,
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontWeight: "700",
                                        fontSize: 16,
                                    }}
                                >
                                    Done
                                </Text>
                            </PressableScale>
                        </View>
                    </Animated.View>
                </GlassOrBlurView>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { fontWeight: "600", fontSize: 16 },
    button: {
        borderRadius: 24,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    buttonText: { fontSize: 14 },
    colorPreview: { width: 20, height: 20, marginRight: 8, borderRadius: 999 },
    panel: { borderRadius: 20, width: "70%", height: "70%", alignSelf: "center" },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    modalContent: {
        width: "100%",
        maxWidth: 420,
        borderRadius: 28,
        borderWidth: 1,
        padding: 22,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
    },
    secondaryButton: {
        flex: 1,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: "center",
    },
    primaryButton: {
        flex: 1,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: "center",
    },
})
