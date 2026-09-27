import { useEffect, useMemo } from "react"
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
import { PressableScale } from "pressto"
import { X } from "lucide-react-native"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"
import { GlassView } from "expo-glass-effect"

type Props = {
    body: string | null
    title?: string
    onClose: () => void
}

export default function LogBodyModal({ body, title = "Body", onClose }: Props) {
    const { vars, appearance } = useThemes()

    const scale = useSharedValue(0.96)
    const opacity = useSharedValue(0)

    useEffect(() => {
        if (body) {
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
    }, [body])

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }))

    function close() {
        opacity.value = withTiming(0, {
            duration: 110,
            easing: Easing.in(Easing.quad),
        })

        scale.value = withTiming(0.96, {
            duration: 110,
        })

        setTimeout(onClose, 110)
    }

    const prettyBody = useMemo(() => {
        if (!body) return ""

        try {
            return JSON.stringify(JSON.parse(body), null, 2)
        } catch {
            return body
        }
    }, [body])

    return (
        <Modal visible={body !== null} transparent animationType="none" onRequestClose={close}>
            <GlassView glassEffectStyle="regular" colorScheme={appearance} style={styles.modalOverlay}>
                <Animated.View
                    entering={FadeIn.duration(180)}
                    exiting={FadeOut.duration(120)}
                    style={[styles.animatedModal, animatedStyle]}
                >
                    <GlassView glassEffectStyle="regular" colorScheme={appearance} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: vars.textColor,
                                        fontSize: 24,
                                        fontWeight: "700",
                                    }}
                                >
                                    {title}
                                </Text>

                                <Text
                                    style={{
                                        color: vars.secondaryTextColor,
                                        marginTop: 4,
                                        fontSize: 14,
                                    }}
                                >
                                    Decompressed payload
                                </Text>
                            </View>

                            <GlassView
                                glassEffectStyle="regular"
                                isInteractive
                                colorScheme={appearance}
                                style={styles.closeGlass}
                            >
                                <PressableScale onPress={close} style={styles.closeButton}>
                                    <X size={18} strokeWidth={2} color={vars.textColor} />
                                </PressableScale>
                            </GlassView>
                        </View>

                        {/* Body */}
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View
                                style={[
                                    styles.codeContainer,
                                    {
                                        backgroundColor: vars.secondaryBackgroundColor,
                                        borderColor: vars.secondaryBorderColor,
                                    },
                                ]}
                            >
                                <Text
                                    selectable
                                    style={[
                                        styles.code,
                                        {
                                            color: vars.textColor,
                                        },
                                    ]}
                                >
                                    {prettyBody}
                                </Text>
                            </View>
                        </ScrollView>

                        <GlassView
                            glassEffectStyle="regular"
                            isInteractive
                            colorScheme={appearance}
                            style={styles.doneGlass}
                        >
                            <PressableScale
                                onPress={close}
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
            </GlassView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },

    animatedModal: {
        width: "100%",
        maxWidth: 500,
        maxHeight: "85%",
    },

    modalContent: {
        width: "100%",
        maxHeight: "100%",
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
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
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
    },

    codeContainer: {
        borderRadius: BORDER_RADIUS_M,
        borderWidth: 1,
        padding: 16,
    },

    code: {
        fontFamily: "monospace",
        fontSize: 13,
        lineHeight: 20,
    },

    doneGlass: {
        marginTop: 14,
        borderRadius: BORDER_RADIUS_L,
        overflow: "hidden",
    },

    doneButton: {
        borderRadius: BORDER_RADIUS_L,
        paddingVertical: 14,
        alignItems: "center",
    },

    doneText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
})
