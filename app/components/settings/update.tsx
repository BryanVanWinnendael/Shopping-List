import {useState} from "react"
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
import updates from "@/assets/updates.json"
import {PressableScale} from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import {Sparkles, X} from "lucide-react-native"

export default function Update() {
    const { vars, theme } = useThemes()

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
                    <View
                        style={[
                            styles.iconWrapper,
                            {
                                backgroundColor: `${vars.accentColor}20`,
                            },
                        ]}
                    >
                        <Sparkles size={18} color={vars.accentColor} />
                    </View>

                    <View>
                        <Text style={[styles.title, { color: vars.textColor }]}>Release Notes</Text>

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
                        Read
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

                        <ScrollView
                            style={{ marginTop: 20 }}
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
                                                backgroundColor: `${vars.accentColor}20`,
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                borderRadius: 999,
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
                                    </View>

                                    <View style={{ gap: 12 }}>
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
                                                        borderRadius: 999,
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

                        <PressableScale
                            onPress={closeModal}
                            style={{
                                marginTop: 24,
                                backgroundColor: vars.accentColor,
                                paddingVertical: 14,
                                borderRadius: 18,
                                alignItems: "center",
                            }}
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
        maxHeight: "80%",
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
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
        paddingRight: 50,
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },
})
