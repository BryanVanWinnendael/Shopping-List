import { useState } from "react"
import { Modal, StyleSheet, Text, View } from "react-native"
import { Palette, X } from "lucide-react-native"
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
import CustomSwitch from "@/components/customSwitch"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M, DEFAULT_ACOLOR } from "@/lib/theme"
import useThemes from "@/hooks/themes/useThemes"

export default function AColor() {
    const { vars, theme } = useThemes()
    const { aColor, setAColor, setAColorUse, aColorUse } = useSettingsStore()

    const currentColor = useSharedValue(aColor)
    const scale = useSharedValue(0.96)
    const opacity = useSharedValue(0)

    const [modalVisible, setModalVisible] = useState(false)
    const [pickedColor, setPickedColor] = useState(aColor)

    const colorScheme = theme === "light" ? "light" : "dark"

    const onColorChange = (color: ColorFormatsObject) => {
        "worklet"

        currentColor.value = color.hex

        scale.value = withSpring(1.05)
    }

    const onColorPick = (color: ColorFormatsObject) => {
        setPickedColor(color.hex)
        setAColor(color.hex)

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    const resetToDefault = () => {
        setPickedColor(DEFAULT_ACOLOR)
        setAColor(DEFAULT_ACOLOR)
        setModalVisible(false)
    }

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }))

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
        <View
            style={[
                styles.container,
                {
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderColor: vars.secondaryBorderColor,
                    borderWidth: 1,
                },
            ]}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <GlassView
                        glassEffectStyle="regular"
                        isInteractive={false}
                        colorScheme={colorScheme}
                        style={styles.iconGlass}
                    >
                        <View style={styles.iconWrapper}>
                            <Palette size={18} strokeWidth={2} color={vars.accentColor} />
                        </View>
                    </GlassView>

                    <View style={{ flex: 1 }}>
                        <Text
                            style={[
                                styles.title,
                                {
                                    color: vars.textColor,
                                },
                            ]}
                        >
                            Accent Color
                        </Text>

                        <Text
                            style={[
                                styles.subtitle,
                                {
                                    color: theme === "light" ? "#6b7280" : "#9ca3af",
                                },
                            ]}
                        >
                            Customize app accent styling
                        </Text>
                    </View>
                </View>

                <GlassView glassEffectStyle="regular" isInteractive colorScheme={colorScheme} style={styles.editGlass}>
                    <PressableScale onPress={openModal} style={styles.editButton}>
                        <View
                            style={[
                                styles.colorDot,
                                {
                                    backgroundColor: aColor,
                                },
                            ]}
                        />

                        <Text
                            style={{
                                color: vars.textColor,
                                fontSize: 14,
                                fontWeight: "600",
                            }}
                        >
                            Edit
                        </Text>
                    </PressableScale>
                </GlassView>
            </View>

            <View style={styles.row}>
                <View style={styles.textBlock}>
                    <Text
                        style={[
                            styles.rowTitle,
                            {
                                color: vars.textColor,
                            },
                        ]}
                    >
                        Use Accent Color for Header
                    </Text>

                    <Text
                        style={[
                            styles.description,
                            {
                                color: theme === "light" ? "#6b7280" : "#9ca3af",
                            },
                        ]}
                    >
                        Applies accent color to the app header.
                    </Text>
                </View>

                <CustomSwitch
                    value={aColorUse.header}
                    onChange={(val) =>
                        setAColorUse({
                            ...aColorUse,
                            header: val,
                        })
                    }
                />
            </View>

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
                                        Accent Color
                                    </Text>

                                    <Text
                                        style={{
                                            color: theme === "light" ? "#6b7280" : "#9ca3af",
                                            marginTop: 4,
                                            fontSize: 14,
                                        }}
                                    >
                                        Customize app accent styling
                                    </Text>
                                </View>

                                <GlassView
                                    glassEffectStyle="regular"
                                    isInteractive
                                    colorScheme={colorScheme}
                                    style={styles.closeGlass}
                                >
                                    <PressableScale onPress={closeModal} style={styles.closeButton}>
                                        <X size={18} strokeWidth={2} color={vars.textColor} />
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
                                                backgroundColor: `${aColor}E6`,
                                            },
                                        ]}
                                    >
                                        <Text style={styles.primaryText}>Done</Text>
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
    container: {
        borderRadius: BORDER_RADIUS_L,
        marginHorizontal: 8,
        paddingHorizontal: 18,
        paddingTop: 18,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 14,
        marginBottom: 10,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    iconGlass: {
        width: 42,
        height: 42,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: BORDER_RADIUS_FULL,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    editGlass: {
        height: 40,
        minWidth: 76,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
    },
    editButton: {
        height: 40,
        minWidth: 76,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    colorDot: {
        width: 18,
        height: 18,
        marginRight: 8,
        borderRadius: BORDER_RADIUS_FULL,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
    },
    textBlock: {
        flex: 1,
        paddingRight: 12,
    },
    rowTitle: {
        fontSize: 15,
        fontWeight: "600",
    },
    description: {
        fontSize: 12,
        marginTop: 3,
        lineHeight: 16,
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
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    colorPickerContainer: {
        marginTop: 24,
        alignItems: "center",
    },
    colorPicker: {
        width: 280,
        height: 280,
    },
    hueContainer: {
        width: 280,
        height: 280,
        justifyContent: "center",
        alignItems: "center",
    },
    panel: {
        width: "72%",
        height: "72%",
        borderRadius: BORDER_RADIUS_L,
        alignSelf: "center",
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
    },
    secondaryGlass: {
        flex: 1,
        minHeight: 48,
        borderRadius: BORDER_RADIUS_M,
        overflow: "hidden",
    },
    secondaryButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    primaryGlass: {
        flex: 1,
        minHeight: 48,
        borderRadius: BORDER_RADIUS_M,
        overflow: "hidden",
    },
    primaryButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
})
