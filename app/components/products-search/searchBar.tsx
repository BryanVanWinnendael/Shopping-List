import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated"
import { StyleSheet, TextInput } from "react-native"
import { Search, X } from "lucide-react-native"
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

const AnimatedView = Animated.createAnimatedComponent(Animated.View)

export function SearchBar({ value, updateQuery }: Props) {
    const { vars, appearance } = useThemes()

    const scale = useSharedValue(1)

    const handleFocus = () => {
        scale.value = withSequence(withTiming(1.03, { duration: 120 }), withTiming(1, { duration: 180 }))
    }

    const clear = () => updateQuery("")

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: scale.value,
            },
        ],
    }))

    return (
        <AnimatedView style={[styles.container, animatedStyle]}>
            <LiquidGlassView style={styles.glass} isInteractive>
                <Search size={FAB_ICON_SIZE} color={vars.textColor} />
                <TextInput
                    value={value}
                    onChangeText={updateQuery}
                    onFocus={handleFocus}
                    placeholder="Search products..."
                    placeholderTextColor={vars.tertiaryTextColor}
                    returnKeyType="search"
                    style={[styles.input, { color: vars.textColor }]}
                    keyboardAppearance={appearance}
                />
                {value.length > 0 && (
                    <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut.duration(120)}>
                        <PressableScale onPress={clear} hitSlop={10} style={styles.clearButton}>
                            <X size={BAR_CLEAR_ICON_SIZE} color={vars.textColor} />
                        </PressableScale>
                    </Animated.View>
                )}
            </LiquidGlassView>
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: DOCK_BOTTOM,
        left: DOCK_SIDE,
        right: SEARCH_BAR_RIGHT,
        zIndex: 1,
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
