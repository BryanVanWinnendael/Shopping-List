import { useEffect, useMemo, useRef } from "react"
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated"
import { PressableScale } from "pressto"
import { X } from "lucide-react-native"
import LiquidGlassView from "@/components/native/liquidGlassView"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    body: string | null
    title?: string
    onClose: () => void
}

const HIDDEN_SCALE = 0.96
const CLOSE_DURATION = 110

const OPEN_FADE = { duration: 140, easing: Easing.out(Easing.quad) }
const OPEN_SPRING = { damping: 18, stiffness: 240, mass: 0.6 }
const CLOSE_FADE = { duration: CLOSE_DURATION, easing: Easing.in(Easing.quad) }
const CLOSE_SCALE = { duration: CLOSE_DURATION }

function formatBody(body: string | null) {
    if (!body) return ""

    try {
        return JSON.stringify(JSON.parse(body), null, 2)
    } catch {
        return body
    }
}

export default function LogBodyModal({ body, title = "Body", onClose }: Props) {
    const { vars } = useThemes()

    const scale = useSharedValue(HIDDEN_SCALE)
    const opacity = useSharedValue(0)
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const prettyBody = useMemo(() => formatBody(body), [body])

    useEffect(() => {
        if (body) {
            opacity.value = withTiming(1, OPEN_FADE)
            scale.value = withSpring(1, OPEN_SPRING)
        } else {
            // Reset so the next open always starts from the hidden state,
            // even if the parent cleared `body` without going through close().
            opacity.value = 0
            scale.value = HIDDEN_SCALE
        }
    }, [body, opacity, scale])

    useEffect(() => {
        return () => {
            if (closeTimer.current) clearTimeout(closeTimer.current)
        }
    }, [])

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }))

    const close = () => {
        // Ignore repeated taps while the close animation is running.
        if (closeTimer.current) return

        opacity.value = withTiming(0, CLOSE_FADE)
        scale.value = withTiming(HIDDEN_SCALE, CLOSE_SCALE)

        closeTimer.current = setTimeout(() => {
            closeTimer.current = null
            onClose()
        }, CLOSE_DURATION)
    }

    return (
        <Modal visible={body !== null} transparent animationType="none" onRequestClose={close}>
            <LiquidGlassView style={styles.overlay}>
                <Animated.View style={[styles.animatedModal, animatedStyle]}>
                    <LiquidGlassView style={styles.content}>
                        <View style={styles.header}>
                            <View style={styles.headerText}>
                                <Text style={[styles.title, { color: vars.textColor }]}>{title}</Text>
                                <Text style={[styles.subtitle, { color: vars.secondaryTextColor }]}>
                                    Decompressed payload
                                </Text>
                            </View>

                            <LiquidGlassView style={styles.closeGlass} isInteractive>
                                <PressableScale
                                    onPress={close}
                                    accessibilityRole="button"
                                    accessibilityLabel="Close"
                                    style={styles.closeButton}
                                >
                                    <X size={18} strokeWidth={2} color={vars.textColor} />
                                </PressableScale>
                            </LiquidGlassView>
                        </View>

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
                                <Text selectable style={[styles.code, { color: vars.textColor }]}>
                                    {prettyBody}
                                </Text>
                            </View>
                        </ScrollView>

                        <LiquidGlassView style={styles.doneGlass} isInteractive>
                            <PressableScale
                                onPress={close}
                                accessibilityRole="button"
                                accessibilityLabel="Done"
                                style={[styles.doneButton, { backgroundColor: `${vars.accentColor}E6` }]}
                            >
                                <Text style={styles.doneText}>Done</Text>
                            </PressableScale>
                        </LiquidGlassView>
                    </LiquidGlassView>
                </Animated.View>
            </LiquidGlassView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    animatedModal: {
        width: "100%",
        maxWidth: 500,
        maxHeight: "85%",
    },
    content: {
        width: "100%",
        maxHeight: "100%",
        borderRadius: BORDER_RADIUS_L,
        padding: 22,
        overflow: "hidden",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
    },
    subtitle: {
        marginTop: 4,
        fontSize: 14,
    },
    closeGlass: {
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
        borderWidth: 1,
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
    },
    codeContainer: {
        borderRadius: BORDER_RADIUS_M,
        borderWidth: 1,
        padding: 16,
    },
    code: {
        fontFamily: "Menlo",
        fontSize: 13,
        lineHeight: 20,
    },
    doneGlass: {
        marginTop: 14,
        borderRadius: BORDER_RADIUS_L,
        overflow: "hidden",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
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
