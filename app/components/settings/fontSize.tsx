import { useState } from "react"
import { Modal, StyleSheet, Text, View } from "react-native"
import Slider from "@react-native-community/slider"
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
import CategoryIcon from "@/components/categoryIcon"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { DEFAULT_FONT_SIZE, MAX_FONT_SIZE, MIN_FONT_SIZE } from "@/lib/constants"
import { Type, X } from "lucide-react-native"

export default function FontSize() {
    const { vars, theme } = useThemes()
    const { fontSize, setFontSize } = useSettingsStore()

    const scale = useSharedValue(0.96)
    const opacity = useSharedValue(0)

    const [modalVisible, setModalVisible] = useState(false)
    const [tempFontSize, setTempFontSize] = useState(fontSize)

    const getTextSize = tempFontSize / 2
    const getLabelSize = tempFontSize / 3

    const resetFontSize = () => {
        scale.value = withSpring(1)
        setTempFontSize(DEFAULT_FONT_SIZE)
        setFontSize(DEFAULT_FONT_SIZE)
    }

    const applyFontSize = () => {
        setFontSize(tempFontSize)
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
            <View style={styles.row}>
                <View style={styles.titleContainer}>
                    <View
                        style={[
                            styles.iconWrapper,
                            {
                                backgroundColor: `${vars.accentColor}20`,
                            },
                        ]}
                    >
                        <Type size={18} color={vars.accentColor} />
                    </View>

                    <View>
                        <Text style={[styles.title, { color: vars.textColor }]}>Font Size</Text>

                        <Text
                            style={{
                                color: theme === "light" ? "#6b7280" : "#9ca3af",
                                marginTop: 2,
                                fontSize: 13,
                            }}
                        >
                            Customize product text size
                        </Text>
                    </View>
                </View>

                <PressableScale
                    onPress={openModal}
                    style={[
                        styles.readButton,
                        {
                            backgroundColor: vars.backgroundColor,
                            borderColor: vars.borderColor,
                        },
                    ]}
                >
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
                                    Font Size
                                </Text>

                                <Text
                                    style={{
                                        color: theme === "light" ? "#6b7280" : "#9ca3af",
                                        marginTop: 4,
                                        fontSize: 14,
                                    }}
                                >
                                    Customize product text size
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
                            <Slider
                                style={styles.slider}
                                minimumValue={MIN_FONT_SIZE}
                                maximumValue={MAX_FONT_SIZE}
                                maximumTrackTintColor={vars.secondaryBackgroundColor}
                                step={1}
                                value={tempFontSize}
                                onValueChange={(val) => setTempFontSize(Math.round(val))}
                                minimumTrackTintColor={vars.accentColor}
                                onSlidingStart={() => {
                                    scale.value = withSpring(1.02)
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                }}
                                onSlidingComplete={() => {
                                    scale.value = withSpring(1)
                                }}
                            />
                        </View>

                        <View
                            style={[
                                styles.previewContainer,
                                {
                                    backgroundColor: vars.secondaryBackgroundColor,
                                    marginTop: 24,
                                },
                            ]}
                        >
                            <View style={styles.previewRow}>
                                <View style={styles.previewIcon}>
                                    <CategoryIcon category="remaining" />
                                </View>

                                <View
                                    style={[
                                        styles.previewTextWrapper,
                                        {
                                            borderColor: vars.borderColor,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            fontSize: getTextSize,
                                            color: vars.textColor,
                                        }}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        Font size preview
                                    </Text>

                                    <Text
                                        style={{
                                            fontSize: getLabelSize,
                                            color: theme === "light" ? "#9ca3af" : "#50555C",
                                            marginTop: 8,
                                            textAlign: "right",
                                        }}
                                    >
                                        added by
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                gap: 12,
                                marginTop: 24,
                            }}
                        >
                            <PressableScale
                                onPress={resetFontSize}
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
                                onPress={applyFontSize}
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
    container: {
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 18,
        marginHorizontal: 8,
        borderWidth: 1,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
        paddingRight: 16,
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontWeight: "700",
        fontSize: 18,
    },
    readButton: {
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
    },
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
    slider: {
        width: "100%",
        height: 48,
    },
    previewContainer: {
        minHeight: 110,
        borderRadius: 18,
        paddingHorizontal: 12,
    },
    previewRow: {
        flexDirection: "row",
        paddingVertical: 12,
        alignItems: "flex-start",
        gap: 8,
    },
    previewIcon: {
        width: 48,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 4,
    },
    previewTextWrapper: {
        flex: 1,
        borderBottomWidth: 1,
        justifyContent: "center",
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
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
    resetText: {
        fontSize: 14,
        fontWeight: "600",
    },
    doneText: {
        fontSize: 16,
        fontWeight: "700",
    },
})
