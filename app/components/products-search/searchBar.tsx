import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated"
import { TextInput } from "react-native"
import { Search, X } from "lucide-react-native"

import useThemes from "@/hooks/themes/useThemes"
import GlassOrBlurView from "@/components/glassOrBlurView"
import { PressableScale } from "pressto"

type Props = {
    value: string
    updateQuery: (text: string) => void
}

const AnimatedView = Animated.createAnimatedComponent(Animated.View)

export function SearchBar({ value, updateQuery }: Props) {
    const { vars } = useThemes()

    const scale = useSharedValue(1)

    const handleFocus = () => {
        scale.value = withSequence(withTiming(1.03, { duration: 120 }), withTiming(1, { duration: 180 }))
    }

    const clear = () => updateQuery("")

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    return (
        <AnimatedView
            style={[
                {
                    position: "absolute",
                    bottom: 24,
                    left: 24,
                    right: 88,
                    zIndex: 1,
                },
                animatedStyle,
            ]}
        >
            <GlassOrBlurView
                backgroundColor={vars.secondaryBackgroundColor}
                borderColor={`${vars.secondaryBorderColor}50`}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    height: 52,
                    borderRadius: 26,
                }}
            >
                <Search size={20} color={vars.textColor} />

                <TextInput
                    value={value}
                    onChangeText={updateQuery}
                    onFocus={handleFocus}
                    placeholder="Search products..."
                    placeholderTextColor="gray"
                    returnKeyType="search"
                    style={{
                        flex: 1,
                        marginLeft: 10,
                        fontSize: 17,
                        color: vars.textColor,
                    }}
                />

                {value.length > 0 && (
                    <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut.duration(120)}>
                        <PressableScale
                            onPress={clear}
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
            </GlassOrBlurView>
        </AnimatedView>
    )
}
