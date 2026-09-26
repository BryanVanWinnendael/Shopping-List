import { useEffect, useRef } from "react"
import { StyleSheet, View } from "react-native"
import { PressableScale } from "pressto"
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated"
import { GlassView } from "expo-glass-effect"
import { Grid2X2, List } from "lucide-react-native"

import useThemes from "@/hooks/themes/useThemes"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { BORDER_RADIUS_L } from "@/lib/theme"

type Props = {
    value: "grid" | "list"
    setStyle: (val: "grid" | "list") => void
    collapsed: boolean
}

const OPTIONS: Array<"grid" | "list"> = ["grid", "list"]

const EXPANDED_WIDTH = 110
const COLLAPSED_WIDTH = 48
const SEGMENT_WIDTH = EXPANDED_WIDTH / OPTIONS.length

export default function StyleButton({ value, setStyle, collapsed }: Props) {
    const { vars } = useThemes()
    const { theme } = useSettingsStore()

    const translateX = useSharedValue(0)
    const scale = useSharedValue(1)

    const prevValue = useRef(value)

    const selectedIndex = OPTIONS.findIndex((o) => o === value)

    useEffect(() => {
        translateX.value = withTiming(SEGMENT_WIDTH * selectedIndex, { duration: 200 })
    }, [selectedIndex])

    useEffect(() => {
        if (collapsed) {
            scale.value = withSequence(withTiming(1.03, { duration: 120 }), withTiming(1, { duration: 180 }))
        }
    }, [collapsed])

    useEffect(() => {
        if (prevValue.current !== value) {
            scale.value = withSequence(withTiming(1.03, { duration: 100 }), withTiming(1, { duration: 150 }))

            prevValue.current = value
        }
    }, [value])

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: translateX.value,
            },
        ],
    }))

    const containerStyle = useAnimatedStyle(() => ({
        width: withTiming(collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH, { duration: 250 }),
        transform: [
            {
                scale: scale.value,
            },
        ],
    }))

    return (
        <View style={styles.wrapper}>
            <Animated.View style={containerStyle}>
                <GlassView
                    glassEffectStyle="regular"
                    isInteractive
                    colorScheme={theme === "light" ? "light" : "dark"}
                    style={styles.container}
                >
                    {collapsed ? (
                        <Animated.View
                            entering={FadeIn.duration(150)}
                            exiting={FadeOut.duration(150)}
                            style={styles.activeIconContainer}
                        >
                            {value === "grid" ? (
                                <Grid2X2 size={22} color={vars.textColor} />
                            ) : (
                                <List size={22} color={vars.textColor} />
                            )}
                        </Animated.View>
                    ) : (
                        <Animated.View
                            entering={FadeIn.duration(150)}
                            exiting={FadeOut.duration(150)}
                            style={styles.expandedContent}
                        >
                            <Animated.View
                                style={[
                                    styles.indicator,
                                    {
                                        width: SEGMENT_WIDTH,
                                        backgroundColor: vars.backgroundColor,
                                    },
                                    indicatorStyle,
                                ]}
                            />

                            <PressableScale onPress={() => setStyle("grid")} style={styles.button}>
                                <Grid2X2 size={22} color={value === "grid" ? vars.textColor : "gray"} />
                            </PressableScale>

                            <PressableScale onPress={() => setStyle("list")} style={styles.button}>
                                <List size={22} color={value === "list" ? vars.textColor : "gray"} />
                            </PressableScale>
                        </Animated.View>
                    )}
                </GlassView>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        bottom: 24,
        right: 24,
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BORDER_RADIUS_L,
        height: 48,
        overflow: "hidden",
    },
    expandedContent: {
        flex: 1,
        flexDirection: "row",
        height: "100%",
    },
    indicator: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        borderRadius: BORDER_RADIUS_L,
    },
    button: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    activeIconContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
})
