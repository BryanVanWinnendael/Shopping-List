import { useEffect } from "react"
import { StyleSheet, TextInput, useWindowDimensions } from "react-native"
import { Search, X } from "lucide-react-native"
import LiquidGlassView from "@/components/native/liquidGlassView"
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated"
import { PressableScale } from "pressto"

import useThemes from "@/hooks/themes/useThemes"
import {
    BAR_FONT_SIZE,
    BAR_HEIGHT,
    BAR_PADDING_H,
    BORDER_RADIUS_L,
    DOCK_BOTTOM,
    DOCK_SIDE,
    FAB_SIZE,
    SEARCH_BAR_RIGHT_DOUBLE,
} from "@/lib/theme"

type Props = {
    value: string
    updateQuery: (text: string) => void
    filterExpanded: boolean
    onSearchPress: () => void
}

const AnimatedView = Animated.createAnimatedComponent(Animated.View)
const AnimatedGlassView = Animated.createAnimatedComponent(LiquidGlassView)

export function SearchBar({ value, updateQuery, filterExpanded, onSearchPress }: Props) {
    const { vars, appearance } = useThemes()
    const { width } = useWindowDimensions()

    const right = useSharedValue(SEARCH_BAR_RIGHT_DOUBLE)
    const scale = useSharedValue(1)
    const borderRadius = useSharedValue(BORDER_RADIUS_L)

    const handleFocus = () => {
        scale.value = withSequence(withTiming(1.03, { duration: 120 }), withTiming(1, { duration: 180 }))
    }

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const containerStyle = useAnimatedStyle(() => ({
        right: right.value,
    }))

    const glassStyle = useAnimatedStyle(() => ({
        borderRadius: borderRadius.value,
    }))

    useEffect(() => {
        right.value = withTiming(filterExpanded ? width - 72 : SEARCH_BAR_RIGHT_DOUBLE, { duration: 250 })

        borderRadius.value = withTiming(filterExpanded ? 24 : BORDER_RADIUS_L, { duration: 250 })
    }, [filterExpanded, width])

    return (
        <AnimatedView style={[styles.container, containerStyle, animatedStyle]}>
            <AnimatedGlassView
                isInteractive
                style={[
                    styles.glass,
                    {
                        justifyContent: filterExpanded ? "center" : undefined,
                        paddingHorizontal: filterExpanded ? 0 : 16,
                    },
                    glassStyle,
                ]}
            >
                <PressableScale
                    onPress={() => {
                        if (filterExpanded) {
                            onSearchPress()
                        }
                    }}
                    hitSlop={10}
                    style={filterExpanded ? styles.iconButton : undefined}
                >
                    <Search size={18} strokeWidth={2} color={vars.textColor} />
                </PressableScale>

                {!filterExpanded && (
                    <>
                        <TextInput
                            value={value}
                            onChangeText={updateQuery}
                            onFocus={handleFocus}
                            placeholder="Search recipes..."
                            placeholderTextColor={vars.tertiaryTextColor}
                            returnKeyType="search"
                            style={[styles.input, { color: vars.textColor }]}
                            keyboardAppearance={appearance}
                        />

                        {value.length > 0 && (
                            <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut.duration(120)}>
                                <PressableScale onPress={() => updateQuery("")} hitSlop={10} style={styles.clearButton}>
                                    <X size={16} strokeWidth={2} color={vars.textColor} />
                                </PressableScale>
                            </Animated.View>
                        )}
                    </>
                )}
            </AnimatedGlassView>
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: DOCK_BOTTOM,
        left: DOCK_SIDE,
        right: SEARCH_BAR_RIGHT_DOUBLE,
        zIndex: 10,
    },
    glass: {
        flexDirection: "row",
        alignItems: "center",
        height: BAR_HEIGHT,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    iconButton: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        justifyContent: "center",
        alignItems: "center",
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: BAR_FONT_SIZE,
    },
    clearButton: {
        padding: 4,
        marginLeft: 6,
    },
})
