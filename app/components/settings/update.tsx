import { useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native"
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import { BlurView } from "expo-blur"
import LiquidGlassView from "@/components/native/liquidGlassView"
import updates from "@/assets/updates.json"
import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import { Sparkles, X } from "lucide-react-native"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, SHEET_CTA_HEIGHT } from "@/lib/theme"

export default function Update() {
    const { vars, theme, appearance } = useThemes()

    const [modalVisible, setModalVisible] = useState(false)

    const scale = useSharedValue(0.96)
    const opacity = useSharedValue(0)

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
                            <Sparkles size={18} strokeWidth={2} color={vars.accentColor} />
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
                            Release Notes
                        </Text>

                        <Text
                            style={[
                                styles.subtitle,
                                {
                                    color: theme === "light" ? "#6b7280" : "#9ca3af",
                                },
                            ]}
                        >
                            Latest app improvements and updates
                        </Text>
                    </View>
                </View>

                <LiquidGlassView style={styles.readGlass} isInteractive>
                    <PressableScale onPress={openModal} style={styles.readButton}>
                        <Text style={[styles.readText, { color: vars.textColor }]}>Read</Text>
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
                                    <Text style={[styles.modalTitle, { color: vars.textColor }]}>Release Notes</Text>

                                    <Text
                                        style={[
                                            styles.modalSubtitle,
                                            {
                                                color: theme === "light" ? "#6b7280" : "#9ca3af",
                                            },
                                        ]}
                                    >
                                        Latest app improvements and updates
                                    </Text>
                                </View>

                                <LiquidGlassView style={styles.closeGlass} isInteractive>
                                    <PressableScale onPress={closeModal} style={styles.closeButton}>
                                        <X size={18} strokeWidth={2} color={vars.textColor} />
                                    </PressableScale>
                                </LiquidGlassView>
                            </View>

                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {updates.map((update, index) => (
                                    <View key={index}>
                                        <View style={styles.metaRow}>
                                            <View style={styles.metaBadges}>
                                                <View
                                                    style={[
                                                        styles.dateBadge,
                                                        {
                                                            backgroundColor: `${vars.accentColor}20`,
                                                        },
                                                    ]}
                                                >
                                                    <Text style={[styles.dateText, { color: vars.accentColor }]}>
                                                        {update.date}
                                                    </Text>
                                                </View>

                                                {update.version && (
                                                    <LiquidGlassView style={styles.versionGlass}>
                                                        <View style={styles.versionInner}>
                                                            <Text
                                                                style={[styles.versionText, { color: vars.textColor }]}
                                                            >
                                                                v{update.version}
                                                            </Text>
                                                        </View>
                                                    </LiquidGlassView>
                                                )}
                                            </View>
                                        </View>

                                        <View style={styles.pointsList}>
                                            {update.text.map((point, idx) => (
                                                <View key={idx} style={styles.pointRow}>
                                                    <View
                                                        style={[
                                                            styles.dot,
                                                            {
                                                                backgroundColor: vars.accentColor,
                                                            },
                                                        ]}
                                                    />

                                                    <Text style={[styles.pointText, { color: vars.textColor }]}>
                                                        {point}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            <LiquidGlassView style={styles.doneGlass} isInteractive>
                                <PressableScale
                                    onPress={closeModal}
                                    style={[
                                        styles.doneButton,
                                        {
                                            backgroundColor: `${vars.accentColor}E6`,
                                        },
                                    ]}
                                >
                                    <Text style={styles.doneText}>Done</Text>
                                </PressableScale>
                            </LiquidGlassView>
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
        paddingRight: 50,
    },
    title: {
        fontWeight: "700",
        fontSize: 18,
    },
    subtitle: {
        marginTop: 2,
        fontSize: 13,
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
    readGlass: {
        height: 40,
        minWidth: 64,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    readButton: {
        height: 40,
        minWidth: 64,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    readText: {
        fontSize: 14,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    animatedModal: {
        width: "100%",
        maxWidth: 420,
        maxHeight: "90%",
    },
    modalContent: {
        width: "100%",
        maxHeight: "90%",
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
        width: 40,
        height: 40,
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
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollView: {
        marginTop: 20,
    },
    scrollContent: {
        paddingBottom: 10,
        gap: 24,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    metaBadges: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },
    dateBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS_FULL,
    },
    dateText: {
        fontWeight: "700",
        fontSize: 13,
    },
    versionGlass: {
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    versionInner: {
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    versionText: {
        fontWeight: "600",
        fontSize: 12,
    },
    pointsList: {
        gap: 12,
    },
    pointRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: BORDER_RADIUS_FULL,
        marginTop: 8,
        marginRight: 12,
    },
    pointText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
    },
    doneGlass: {
        marginTop: 24,
        minHeight: SHEET_CTA_HEIGHT,
        borderRadius: BORDER_RADIUS_L,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    doneButton: {
        minHeight: SHEET_CTA_HEIGHT,
        borderRadius: BORDER_RADIUS_L,
        alignItems: "center",
        justifyContent: "center",
    },
    doneText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
})
