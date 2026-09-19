import { TextInput } from "react-native"
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

const AnimatedView = Animated.createAnimatedComponent(Animated.View)

export function SearchBar({ value, updateQuery }: Props) {
    const { vars, theme } = useThemes()

    const scale = useSharedValue(1)

    const handleFocus = () => {
        scale.value = withSequence(withTiming(1.03, { duration: 120 }), withTiming(1, { duration: 180 }))
    }

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: scale.value,
            },
        ],
    }))

    return (
        <AnimatedView
            style={[
                {
                    position: "absolute",
                    bottom: 24,
                    left: 24,
                    right: 88,
                    zIndex: 10,
                },
                animatedStyle,
            ]}
        >
            <GlassView
                glassEffectStyle="regular"
                isInteractive
                colorScheme={theme === "light" ? "light" : "dark"}
                tintColor={vars.secondaryBackgroundColor}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    height: 48,
                    borderRadius: BORDER_RADIUS_L,
                    overflow: "hidden",
                }}
            >
                <Search size={20} color={vars.textColor} />

                <TextInput
                    value={value}
                    onChangeText={updateQuery}
                    onFocus={handleFocus}
                    placeholder="Search logs..."
                    placeholderTextColor="gray"
                    returnKeyType="search"
                    style={{
                        flex: 1,
                        marginLeft: 10,
                        fontSize: 17,
                        color: vars.textColor,
                    }}
                    keyboardAppearance={theme === "light" ? "light" : "dark"}
                />

                {value.length > 0 && (
                    <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut.duration(120)}>
                        <PressableScale
                            onPress={() => updateQuery("")}
                            hitSlop={10}
                            style={{
                                padding: 4,
                                marginLeft: 6,
                            }}
                        >
                            <X size={18} color={vars.textColor} />
                        </PressableScale>
                    </Animated.View>
                )}
            </GlassView>
        </AnimatedView>
    )
}
