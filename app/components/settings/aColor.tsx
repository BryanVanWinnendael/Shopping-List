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
import { useSettingsStore } from "@/stores/useSettingsStore"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import CustomSwitch from "@/components/customSwitch"
import { DEFAULT_ACOLOR } from "@/lib/theme"
import useThemes from "@/hooks/themes/useThemes"

export default function AColor() {
    const { vars, theme } = useThemes()
    const { aColor, setAColor, setAColorUse, aColorUse } = useSettingsStore()

    const currentColor = useSharedValue(aColor)
    const scale = useSharedValue(0.96)
    const opacity = useSharedValue(0)

    const [modalVisible, setModalVisible] = useState(false)
    const [pickedColor, setPickedColor] = useState(aColor)

    const onColorChange = (color: ColorFormatsObject) => {
        "worklet"
        currentColor.value = color.hex
        scale.value = withSpring(1.05)
    }

    const onColorPick = async (color: ColorFormatsObject) => {
        setPickedColor(color.hex)
        setAColor(color.hex)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
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
                },
            ]}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <View
                        style={[
                            styles.iconWrapper,
                            {
                                backgroundColor: `${vars.accentColor}20`,
                            },
                        ]}
                    >
                        <Palette size={18} color={vars.accentColor} />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: vars.textColor }]}>Accent Color</Text>

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

                <PressableScale
                    style={[
                        styles.editButton,
                        {
                            borderColor: vars.borderColor,
                            backgroundColor: vars.backgroundColor,
                        },
                    ]}
                    onPress={openModal}
                >
                    <View style={[styles.colorDot, { backgroundColor: aColor }]} />
                    <Text
                        style={{
                            color: vars.textColor,
                            fontSize: 14,
                        }}
                    >
                        Edit
                    </Text>
                </PressableScale>
            </View>

            <View style={styles.row}>
                <View style={styles.textBlock}>
                    <Text style={[styles.rowTitle, { color: vars.textColor }]}>Use Accent Color for Image Picker</Text>
                    <Text
                        style={[
                            styles.description,
                            {
                                color: theme === "light" ? "#6b7280" : "#9ca3af",
                            },
                        ]}
                    >
                        Applies accent color to image upload button.
                    </Text>
                </View>

                <CustomSwitch
                    value={aColorUse.image}
                    onChange={(val) =>
                        setAColorUse({
                            ...aColorUse,
                            image: val,
                        })
                    }
                />
            </View>

            <View style={styles.row}>
                <View style={styles.textBlock}>
                    <Text style={[styles.rowTitle, { color: vars.textColor }]}>Use Accent Color for Send Button</Text>
                    <Text
                        style={[
                            styles.description,
                            {
                                color: theme === "light" ? "#6b7280" : "#9ca3af",
                            },
                        ]}
                    >
                        Applies accent color to message send button.
                    </Text>
                </View>

                <CustomSwitch
                    value={aColorUse.input}
                    onChange={(val) =>
                        setAColorUse({
                            ...aColorUse,
                            input: val,
                        })
                    }
                />
            </View>

            <View style={styles.row}>
                <View style={styles.textBlock}>
                    <Text style={[styles.rowTitle, { color: vars.textColor }]}>Use Accent Color for Header</Text>
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
                                        backgroundColor: aColor,
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
    container: {
        borderRadius: 24,
        marginHorizontal: 8,
        paddingHorizontal: 18,
        paddingTop: 18,
        borderWidth: 1,
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
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 999,
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
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    colorDot: {
        width: 18,
        height: 18,
        marginRight: 8,
        borderRadius: 999,
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
        paddingHorizontal: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 12,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
    },
    resetButton: {
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    doneButton: {
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    resetText: {
        fontSize: 14,
    },
    doneText: {
        fontSize: 14,
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
