import {useEffect, useMemo} from "react"
import {Modal, ScrollView, StyleSheet, Text, View} from "react-native"
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import {PressableScale} from "pressto"
import {X} from "lucide-react-native"

import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    body: string | null
    title?: string
    onClose: () => void
}

export default function LogBodyModal({ body, title = "Body", onClose }: Props) {
    const { vars, theme } = useThemes()

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
                                    color: theme === "light" ? "#6b7280" : "#9ca3af",
                                    marginTop: 4,
                                    fontSize: 14,
                                }}
                            >
                                Decompressed payload
                            </Text>
                        </View>

                        <PressableScale
                            onPress={close}
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

                    <ScrollView
                        style={{ marginTop: 20 }}
                        contentContainerStyle={{
                            paddingBottom: 10,
                        }}
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

                    <PressableScale
                        onPress={close}
                        style={[
                            styles.doneButton,
                            {
                                backgroundColor: vars.accentColor,
                            },
                        ]}
                    >
                        <Text style={styles.doneText}>Done</Text>
                    </PressableScale>
                </Animated.View>
            </GlassOrBlurView>
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
    modalContent: {
        width: "100%",
        maxWidth: 500,
        maxHeight: "85%",
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
    codeContainer: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
    },
    code: {
        fontFamily: "monospace",
        fontSize: 13,
        lineHeight: 20,
    },
    doneButton: {
        marginTop: 24,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: "center",
    },
    doneText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
})
