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
import { GlassView } from "expo-glass-effect"
import { PressableScale } from "pressto"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_L } from "@/lib/theme"

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
            <GlassView glassEffectStyle="regular" isInteractive colorScheme={appearance} style={styles.glass}>
                <Search size={20} color={vars.textColor} />

                <TextInput
                    value={value}
                    onChangeText={updateQuery}
                    onFocus={handleFocus}
                    placeholder="Search logs..."
                    placeholderTextColor="gray"
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
                            <X size={18} color={vars.textColor} />
                        </PressableScale>
                    </Animated.View>
                )}
            </GlassView>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 24,
        left: 24,
        right: 88,
        zIndex: 10,
    },
    glass: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 48,
        borderRadius: BORDER_RADIUS_L,
        overflow: "hidden",
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 17,
    },
    clearButton: {
        padding: 4,
        marginLeft: 6,
    },
})
