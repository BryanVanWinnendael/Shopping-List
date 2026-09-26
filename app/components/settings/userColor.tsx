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
import { BlurView } from "expo-blur"
import { GlassView } from "expo-glass-effect"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { PressableScale } from "pressto"
import { User } from "@/types"
import useThemes from "@/hooks/themes/useThemes"
import { X } from "lucide-react-native"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

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

    const colorScheme = theme === "light" ? "light" : "dark"

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
        const newColors = {
            ...userColors.colors,
        }

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
            <Text
                style={[
                    styles.title,
                    {
                        color: vars.textColor,
                    },
                ]}
            >
                {user}
            </Text>

            <GlassView glassEffectStyle="regular" isInteractive colorScheme={colorScheme} style={styles.buttonGlass}>
                <PressableScale onPress={openModal} style={styles.button}>
                    <View
                        style={[
                            styles.colorPreview,
                            {
                                backgroundColor: userColors.colors[user] ?? resetColor,
                            },
                        ]}
                    />

                    <Text
                        style={[
                            styles.buttonText,
                            {
                                color: vars.textColor,
                            },
                        ]}
                    >
                        Edit
                    </Text>
                </PressableScale>
            </GlassView>

            <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
                <BlurView intensity={24} tint={theme === "light" ? "light" : "dark"} style={styles.modalOverlay}>
                    <Animated.View
                        entering={FadeIn.duration(180)}
                        exiting={FadeOut.duration(120)}
                        style={[styles.animatedModal, animatedStyle]}
                    >
                        <GlassView glassEffectStyle="regular" colorScheme={colorScheme} style={styles.modalContent}>
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

                                <GlassView
                                    glassEffectStyle="regular"
                                    isInteractive
                                    colorScheme={colorScheme}
                                    style={styles.closeGlass}
                                >
                                    <PressableScale onPress={closeModal} style={styles.closeButton}>
                                        <X size={17} strokeWidth={2} color={vars.textColor} />
                                    </PressableScale>
                                </GlassView>
                            </View>

                            <View style={styles.colorPickerContainer}>
                                <ColorPicker
                                    value={pickedColor}
                                    sliderThickness={20}
                                    thumbSize={24}
                                    onChange={onColorChange}
                                    onCompleteJS={onColorPick}
                                    boundedThumb
                                    style={styles.colorPicker}
                                >
                                    <HueCircular thumbShape="circle" containerStyle={styles.hueContainer}>
                                        <Panel1 style={styles.panel} />
                                    </HueCircular>
                                </ColorPicker>
                            </View>

                            <View style={styles.actions}>
                                <GlassView
                                    glassEffectStyle="regular"
                                    isInteractive
                                    colorScheme={colorScheme}
                                    style={styles.secondaryGlass}
                                >
                                    <PressableScale onPress={resetToDefault} style={styles.secondaryButton}>
                                        <Text
                                            style={{
                                                color: vars.textColor,
                                                fontSize: 14,
                                                fontWeight: "600",
                                            }}
                                        >
                                            Reset
                                        </Text>
                                    </PressableScale>
                                </GlassView>

                                <GlassView
                                    glassEffectStyle="regular"
                                    isInteractive
                                    colorScheme={colorScheme}
                                    style={styles.primaryGlass}
                                >
                                    <PressableScale
                                        onPress={closeModal}
                                        style={[
                                            styles.primaryButton,
                                            {
                                                backgroundColor: `${vars.accentColor}E6`,
                                            },
                                        ]}
                                    >
                                        <Text style={styles.doneText}>Done</Text>
                                    </PressableScale>
                                </GlassView>
                            </View>
                        </GlassView>
                    </Animated.View>
                </BlurView>
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
    title: {
        fontWeight: "600",
        fontSize: 16,
    },
    buttonGlass: {
        height: 36,
        minWidth: 62,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
    },
    button: {
        height: 36,
        minWidth: 62,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: "600",
    },
    colorPreview: {
        width: 18,
        height: 18,
        marginRight: 7,
        borderRadius: BORDER_RADIUS_FULL,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 12,
    },
    animatedModal: {
        width: "100%",
        maxWidth: 420,
        maxHeight: "90%",
    },
    modalContent: {
        width: "100%",
        borderRadius: BORDER_RADIUS_L,
        padding: 22,
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    closeGlass: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
    },
    closeButton: {
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
    },
    colorPickerContainer: {
        marginTop: 24,
        alignItems: "center",
    },
    colorPicker: {
        width: 300,
        height: 300,
    },
    hueContainer: {
        width: 300,
        height: 300,
        justifyContent: "center",
        alignItems: "center",
    },
    panel: {
        borderRadius: BORDER_RADIUS_L,
        width: "72%",
        height: "72%",
        alignSelf: "center",
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 20,
    },
    secondaryGlass: {
        flex: 1,
        minHeight: 48,
        borderRadius: BORDER_RADIUS_M,
        overflow: "hidden",
    },
    secondaryButton: {
        flex: 1,
        minHeight: 48,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
    },
    primaryGlass: {
        flex: 1,
        minHeight: 48,
        borderRadius: BORDER_RADIUS_M,
        overflow: "hidden",
    },
    primaryButton: {
        flex: 1,
        minHeight: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BORDER_RADIUS_M,
    },
    doneText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
})
