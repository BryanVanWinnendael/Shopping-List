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
import { BlurView } from "expo-blur"
import LiquidGlassView from "@/components/native/liquidGlassView"
import CategoryIcon from "@/components/categoryIcon"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import { DEFAULT_FONT_SIZE, MAX_FONT_SIZE, MIN_FONT_SIZE } from "@/lib/constants"
import { Type, X } from "lucide-react-native"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M, SHEET_CTA_HEIGHT } from "@/lib/theme"

export default function FontSize() {
    const { vars, theme, appearance } = useThemes()
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
                },
            ]}
        >
            <View style={styles.row}>
                <View style={styles.titleContainer}>
                    <LiquidGlassView style={styles.iconGlass}>
                        <View style={styles.iconWrapper}>
                            <Type size={18} strokeWidth={2} color={vars.accentColor} />
                        </View>
                    </LiquidGlassView>

                    <View>
                        <Text
                            style={[
                                styles.title,
                                {
                                    color: vars.textColor,
                                },
                            ]}
                        >
                            Font Size
                        </Text>

                        <Text
                            style={[
                                styles.subtitle,
                                {
                                    color: theme === "light" ? "#6b7280" : "#9ca3af",
                                },
                            ]}
                        >
                            Customize product text size
                        </Text>
                    </View>
                </View>

                <LiquidGlassView style={styles.editGlass} isInteractive>
                    <PressableScale onPress={openModal} style={styles.editButton}>
                        <Text style={[styles.editText, { color: vars.textColor }]}>Edit</Text>
                    </PressableScale>
                </LiquidGlassView>
            </View>

            <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
                <BlurView intensity={24} tint={appearance} style={styles.modalOverlay}>
                    <Animated.View
                        entering={FadeIn.duration(180)}
                        exiting={FadeOut.duration(120)}
                        style={[styles.animatedModal, animatedStyle]}
                    >
                        <LiquidGlassView style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={[styles.modalTitle, { color: vars.textColor }]}>Font Size</Text>

                                    <Text
                                        style={[
                                            styles.modalSubtitle,
                                            {
                                                color: theme === "light" ? "#6b7280" : "#9ca3af",
                                            },
                                        ]}
                                    >
                                        Customize product text size
                                    </Text>
                                </View>

                                <LiquidGlassView style={styles.closeGlass} isInteractive>
                                    <PressableScale onPress={closeModal} style={styles.closeButton}>
                                        <X size={17} strokeWidth={2} color={vars.textColor} />
                                    </PressableScale>
                                </LiquidGlassView>
                            </View>

                            <View style={styles.sliderContainer}>
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

                            <LiquidGlassView style={styles.previewContainer}>
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
                                            style={[
                                                styles.previewText,
                                                {
                                                    fontSize: getTextSize,
                                                    color: vars.textColor,
                                                },
                                            ]}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            Font size preview
                                        </Text>

                                        <Text
                                            style={[
                                                styles.previewAddedBy,
                                                {
                                                    fontSize: getLabelSize,
                                                    color: theme === "light" ? "#9ca3af" : "#50555C",
                                                },
                                            ]}
                                        >
                                            added by
                                        </Text>
                                    </View>
                                </View>
                            </LiquidGlassView>

                            <View style={styles.actions}>
                                <LiquidGlassView style={styles.secondaryGlass} isInteractive>
                                    <PressableScale onPress={resetFontSize} style={styles.secondaryButton}>
                                        <Text style={[styles.resetText, { color: vars.textColor }]}>Reset</Text>
                                    </PressableScale>
                                </LiquidGlassView>

                                <PressableScale
                                    onPress={applyFontSize}
                                    style={[
                                        styles.primaryButton,
                                        {
                                            backgroundColor: vars.accentColor,
                                        },
                                    ]}
                                >
                                    <Text style={styles.doneText}>Done</Text>
                                </PressableScale>
                            </View>
                        </LiquidGlassView>
                    </Animated.View>
                </BlurView>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS_L,
        paddingHorizontal: 18,
        paddingVertical: 18,
        marginHorizontal: 8,
        borderWidth: 1,
        overflow: "hidden",
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
    iconGlass: {
        width: 42,
        height: 42,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: BORDER_RADIUS_FULL,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontWeight: "700",
        fontSize: 18,
    },
    subtitle: {
        marginTop: 2,
        fontSize: 13,
    },
    editText: {
        fontSize: 13,
        fontWeight: "600",
    },
    editGlass: {
        height: 36,
        minWidth: 58,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    editButton: {
        height: 36,
        minWidth: 58,
        paddingHorizontal: 14,
        alignItems: "center",
        justifyContent: "center",
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
        borderWidth: 1,
        padding: 22,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
    },
    modalSubtitle: {
        marginTop: 4,
        fontSize: 14,
    },
    closeGlass: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    closeButton: {
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
    },
    sliderContainer: {
        marginTop: 24,
    },
    slider: {
        width: "100%",
        height: 48,
    },
    previewContainer: {
        minHeight: 110,
        borderRadius: BORDER_RADIUS_M,
        borderWidth: 1,
        paddingHorizontal: 12,
        marginTop: 24,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
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
    previewText: {},
    previewAddedBy: {
        marginTop: 8,
        textAlign: "right",
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 20,
    },
    secondaryGlass: {
        flex: 1,
        minHeight: SHEET_CTA_HEIGHT,
        borderRadius: BORDER_RADIUS_M,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    secondaryButton: {
        flex: 1,
        minHeight: SHEET_CTA_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
    },
    resetText: {
        fontSize: 14,
        fontWeight: "600",
    },
    primaryButton: {
        flex: 1,
        minHeight: SHEET_CTA_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BORDER_RADIUS_M,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    doneText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
})
