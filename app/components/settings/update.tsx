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
import { GlassView } from "expo-glass-effect"
import updates from "@/assets/updates.json"
import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import { Sparkles, X } from "lucide-react-native"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"

export default function Update() {
    const { vars, theme } = useThemes()

    const [modalVisible, setModalVisible] = useState(false)

    const scale = useSharedValue(0.96)
    const opacity = useSharedValue(0)

    const colorScheme = theme === "light" ? "light" : "dark"

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
        <GlassView
            glassEffectStyle="regular"
            colorScheme={colorScheme}
            tintColor={vars.secondaryBackgroundColor}
            style={styles.container}
        >
            <View style={styles.row}>
                <View style={styles.titleContainer}>
                    <GlassView
                        glassEffectStyle="regular"
                        isInteractive={false}
                        colorScheme={colorScheme}
                        style={styles.iconGlass}
                    >
                        <View style={styles.iconWrapper}>
                            <Sparkles size={18} strokeWidth={2} color={vars.accentColor} />
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
                            Release Notes
                        </Text>

                        <Text
                            style={{
                                color: theme === "light" ? "#6b7280" : "#9ca3af",
                                marginTop: 2,
                                fontSize: 13,
                            }}
                        >
                            Latest app improvements and updates
                        </Text>
                    </View>
                </View>

                <GlassView glassEffectStyle="regular" isInteractive colorScheme={colorScheme} style={styles.readGlass}>
                    <PressableScale onPress={openModal} style={styles.readButton}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontSize: 14,
                                fontWeight: "600",
                            }}
                        >
                            Read
                        </Text>
                    </PressableScale>
                </GlassView>
            </View>

            <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
                <BlurView intensity={24} tint={theme === "light" ? "light" : "dark"} style={styles.modalOverlay}>
                    <Animated.View
                        entering={FadeIn.duration(180)}
                        exiting={FadeOut.duration(120)}
                        style={[styles.animatedModal, animatedStyle]}
                    >
                        <GlassView
                            glassEffectStyle="regular"
                            colorScheme={colorScheme}
                            tintColor={vars.backgroundColor}
                            style={styles.modalContent}
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
                                        Release Notes
                                    </Text>

                                    <Text
                                        style={{
                                            color: theme === "light" ? "#6b7280" : "#9ca3af",
                                            marginTop: 4,
                                            fontSize: 14,
                                        }}
                                    >
                                        Latest app improvements and updates
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

                            <ScrollView
                                style={{
                                    marginTop: 20,
                                }}
                                contentContainerStyle={{
                                    paddingBottom: 10,
                                    gap: 24,
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                {updates.map((update, index) => (
                                    <View key={index}>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginBottom: 12,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        backgroundColor: `${vars.accentColor}20`,
                                                        paddingHorizontal: 12,
                                                        paddingVertical: 6,
                                                        borderRadius: BORDER_RADIUS_FULL,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: vars.accentColor,
                                                            fontWeight: "700",
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        {update.date}
                                                    </Text>
                                                </View>

                                                {update.version && (
                                                    <GlassView
                                                        glassEffectStyle="regular"
                                                        colorScheme={colorScheme}
                                                        style={{
                                                            borderRadius: BORDER_RADIUS_FULL,
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                paddingHorizontal: 10,
                                                                paddingVertical: 6,
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    color: vars.textColor,
                                                                    fontWeight: "600",
                                                                    fontSize: 12,
                                                                }}
                                                            >
                                                                v{update.version}
                                                            </Text>
                                                        </View>
                                                    </GlassView>
                                                )}
                                            </View>
                                        </View>

                                        <View
                                            style={{
                                                gap: 12,
                                            }}
                                        >
                                            {update.text.map((point, idx) => (
                                                <View
                                                    key={idx}
                                                    style={{
                                                        flexDirection: "row",
                                                        alignItems: "flex-start",
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: BORDER_RADIUS_FULL,
                                                            backgroundColor: vars.accentColor,
                                                            marginTop: 8,
                                                            marginRight: 12,
                                                        }}
                                                    />

                                                    <Text
                                                        style={{
                                                            flex: 1,
                                                            color: vars.textColor,
                                                            fontSize: 16,
                                                            lineHeight: 24,
                                                        }}
                                                    >
                                                        {point}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            <GlassView
                                glassEffectStyle="regular"
                                isInteractive
                                colorScheme={colorScheme}
                                tintColor={vars.accentColor}
                                style={styles.doneGlass}
                            >
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
                            </GlassView>
                        </GlassView>
                    </Animated.View>
                </BlurView>
            </Modal>
        </GlassView>
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
        paddingRight: 50,
    },
    title: {
        fontWeight: "700",
        fontSize: 18,
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
    readGlass: {
        height: 40,
        minWidth: 64,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
    },
    readButton: {
        height: 40,
        minWidth: 64,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
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
    doneGlass: {
        marginTop: 24,
        minHeight: 54,
        borderRadius: BORDER_RADIUS_L,
        overflow: "hidden",
    },
    doneButton: {
        minHeight: 54,
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
