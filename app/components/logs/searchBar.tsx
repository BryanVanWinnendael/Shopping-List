import { StyleSheet, TextInput } from "react-native"
import { Search, X } from "lucide-react-native"
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { PressableScale } from "pressto"

import useThemes from "@/hooks/themes/useThemes"
import {
    BAR_CLEAR_ICON_SIZE,
    BAR_FONT_SIZE,
    BAR_HEIGHT,
    BAR_PADDING_H,
    BORDER_RADIUS_L,
    DOCK_BOTTOM,
    DOCK_SIDE,
    FAB_ICON_SIZE,
    SEARCH_BAR_RIGHT,
} from "@/lib/theme"

type Props = {
    value: string
    updateQuery: (text: string) => void
}

const CLEAR_FADE_IN = FadeIn.duration(120)
const CLEAR_FADE_OUT = FadeOut.duration(120)

export function SearchBar({ value, updateQuery }: Props) {
    const { vars, appearance } = useThemes()

    const scale = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const handleFocus = () => {
        scale.value = withSequence(withTiming(1.03, { duration: 120 }), withTiming(1, { duration: 180 }))
    }

    const clear = () => updateQuery("")

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <LiquidGlassView style={styles.glass} isInteractive>
                <Search size={FAB_ICON_SIZE} color={vars.textColor} />

                <TextInput
                    value={value}
                    onChangeText={updateQuery}
                    onFocus={handleFocus}
                    placeholder="Search logs..."
                    placeholderTextColor={vars.tertiaryTextColor}
                    returnKeyType="search"
                    keyboardAppearance={appearance}
                    style={[styles.input, { color: vars.textColor }]}
                />

                {value.length > 0 && (
                    <Animated.View entering={CLEAR_FADE_IN} exiting={CLEAR_FADE_OUT}>
                        <PressableScale
                            onPress={clear}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel="Clear search"
                            style={styles.clearButton}
                        >
                            <X size={BAR_CLEAR_ICON_SIZE} color={vars.textColor} />
                        </PressableScale>
                    </Animated.View>
                )}
            </LiquidGlassView>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: DOCK_BOTTOM,
        left: DOCK_SIDE,
        right: SEARCH_BAR_RIGHT,
        zIndex: 10,
    },
    glass: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: BAR_PADDING_H,
        height: BAR_HEIGHT,
        borderRadius: BORDER_RADIUS_L,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
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
