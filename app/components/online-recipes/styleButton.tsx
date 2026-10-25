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
import LiquidGlassView from "@/components/native/liquidGlassView"
import { Grid2X2, List } from "lucide-react-native"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, DOCK_BOTTOM, DOCK_SIDE, FAB_ICON_SIZE, FAB_SIZE } from "@/lib/theme"

type Style = "grid" | "list"

type Props = {
    value: Style
    setStyle: (val: Style) => void
    collapsed: boolean
}

const OPTIONS: Style[] = ["grid", "list"]

const ICONS = {
    grid: Grid2X2,
    list: List,
}

const EXPANDED_WIDTH = 110
const COLLAPSED_WIDTH = FAB_SIZE
const SEGMENT_WIDTH = EXPANDED_WIDTH / OPTIONS.length
const ICON_SIZE = FAB_ICON_SIZE

const CONTENT_FADE_IN = FadeIn.duration(150)
const CONTENT_FADE_OUT = FadeOut.duration(150)

export default function StyleButton({ value, setStyle, collapsed }: Props) {
    const { vars } = useThemes()

    const selectedIndex = OPTIONS.indexOf(value)

    // Start from the current state, so nothing animates on mount.
    const translateX = useSharedValue(SEGMENT_WIDTH * selectedIndex)
    const width = useSharedValue(collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH)
    const scale = useSharedValue(1)

    const prevValue = useRef(value)

    const pulse = (inDuration: number, outDuration: number) => {
        scale.value = withSequence(withTiming(1.03, { duration: inDuration }), withTiming(1, { duration: outDuration }))
    }

    useEffect(() => {
        translateX.value = withTiming(SEGMENT_WIDTH * selectedIndex, { duration: 200 })
    }, [selectedIndex, translateX])

    useEffect(() => {
        width.value = withTiming(collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH, { duration: 250 })

        if (collapsed) pulse(120, 180)
    }, [collapsed, width])

    useEffect(() => {
        if (prevValue.current === value) return

        prevValue.current = value
        pulse(100, 150)
    }, [value])

    const containerStyle = useAnimatedStyle(() => ({
        width: width.value,
        transform: [{ scale: scale.value }],
    }))

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }))

    const ActiveIcon = ICONS[value]

    return (
        <View style={styles.wrapper}>
            <Animated.View style={containerStyle}>
                <LiquidGlassView style={styles.container} isInteractive>
                    {collapsed ? (
                        <Animated.View
                            key="collapsed"
                            entering={CONTENT_FADE_IN}
                            exiting={CONTENT_FADE_OUT}
                            style={styles.activeIconContainer}
                        >
                            <ActiveIcon size={ICON_SIZE} color={vars.textColor} />
                        </Animated.View>
                    ) : (
                        <Animated.View
                            key="expanded"
                            entering={CONTENT_FADE_IN}
                            exiting={CONTENT_FADE_OUT}
                            style={styles.expandedContent}
                        >
                            <Animated.View
                                style={[styles.indicator, { backgroundColor: vars.backgroundColor }, indicatorStyle]}
                            />

                            {OPTIONS.map((option) => {
                                const Icon = ICONS[option]
                                const selected = option === value

                                return (
                                    <PressableScale
                                        key={option}
                                        onPress={() => setStyle(option)}
                                        accessibilityRole="button"
                                        accessibilityLabel={`${option} view`}
                                        accessibilityState={{ selected }}
                                        style={styles.button}
                                    >
                                        <Icon
                                            size={ICON_SIZE}
                                            color={selected ? vars.textColor : vars.secondaryTextColor}
                                        />
                                    </PressableScale>
                                )
                            })}
                        </Animated.View>
                    )}
                </LiquidGlassView>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        bottom: DOCK_BOTTOM,
        right: DOCK_SIDE,
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        height: FAB_SIZE,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
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
        width: SEGMENT_WIDTH,
        borderRadius: BORDER_RADIUS_FULL,
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
