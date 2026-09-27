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
import { GlassView } from "expo-glass-effect"
import CategoryIcon from "@/components/categoryIcon"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import { DEFAULT_FONT_SIZE, MAX_FONT_SIZE, MIN_FONT_SIZE } from "@/lib/constants"
import { Type, X } from "lucide-react-native"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

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
                    borderWidth: 1,
                },
            ]}
        >
            <View style={styles.row}>
                <View style={styles.titleContainer}>
                    <GlassView
                        glassEffectStyle="regular"
                        isInteractive={false}
                        colorScheme={appearance}
                        style={styles.iconGlass}
                    >
                        <View style={styles.iconWrapper}>
                            <Type size={18} strokeWidth={2} color={vars.accentColor} />
                        </View>
                    </GlassView>

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

                <GlassView glassEffectStyle="regular" isInteractive colorScheme={appearance} style={styles.editGlass}>
                    <PressableScale onPress={openModal} style={styles.editButton}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontSize: 13,
                                fontWeight: "600",
                            }}
                        >
                            Edit
                        </Text>
                    </PressableScale>
                </GlassView>
            </View>

            <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
                <BlurView intensity={24} tint={appearance} style={styles.modalOverlay}>
                    <Animated.View
                        entering={FadeIn.duration(180)}
                        exiting={FadeOut.duration(120)}
                        style={[styles.animatedModal, animatedStyle]}
                    >
                        <GlassView glassEffectStyle="regular" colorScheme={appearance} style={styles.modalContent}>
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

                                <GlassView
                                    glassEffectStyle="regular"
                                    isInteractive
                                    colorScheme={appearance}
                                    style={styles.closeGlass}
                                >
                                    <PressableScale onPress={closeModal} style={styles.closeButton}>
                                        <X size={17} strokeWidth={2} color={vars.textColor} />
                                    </PressableScale>
                                </GlassView>
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

                            <GlassView
                                glassEffectStyle="regular"
                                colorScheme={appearance}
                                style={styles.previewContainer}
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
                            </GlassView>

                            <View style={styles.actions}>
                                <GlassView
                                    glassEffectStyle="regular"
                                    isInteractive
                                    colorScheme={appearance}
                                    style={styles.secondaryGlass}
                                >
                                    <PressableScale onPress={resetFontSize} style={styles.secondaryButton}>
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
                                    colorScheme={appearance}
                                    style={styles.primaryGlass}
                                >
                                    <PressableScale
                                        onPress={applyFontSize}
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
    container: {
        borderRadius: BORDER_RADIUS_L,
        paddingHorizontal: 18,
        paddingVertical: 18,
        marginHorizontal: 8,
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
        fontWeight: "700",
        fontSize: 18,
    },
    editGlass: {
        height: 36,
        minWidth: 58,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
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
        paddingHorizontal: 12,
        marginTop: 24,
        overflow: "hidden",
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
