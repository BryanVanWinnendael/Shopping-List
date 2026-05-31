import { useEffect } from "react"
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

import useThemes from "@/hooks/themes/useThemes"
import GlassOrBlurView from "@/components/glassOrBlurView"
import { PressableScale } from "pressto"

type Props = {
    value: string
    onChange: (text: string) => void
    focused: boolean
    onFocus: () => void
    onBlur: () => void
}

const AnimatedView = Animated.createAnimatedComponent(Animated.View)

export default function SearchBar({ value, onChange, focused, onFocus, onBlur }: Props) {
    const { vars } = useThemes()

    const scale = useSharedValue(1)

    useEffect(() => {
        if (focused) {
            scale.value = withSequence(withTiming(1.03, { duration: 120 }), withTiming(1, { duration: 180 }))
        }
    }, [focused])

    const animatedStyle = useAnimatedStyle(() => ({
        right: withTiming(focused ? 80 : 146, {
            duration: 250,
        }),
        transform: [{ scale: scale.value }],
    }))

    const clear = () => {
        onChange("")
    }

    return (
        <AnimatedView
            style={[
                {
                    position: "absolute",
                    bottom: 24,
                    left: 24,
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
                    onChangeText={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder="Search recipes..."
                    placeholderTextColor="gray"
                    returnKeyType="search"
                    style={{
                        flex: 1,
                        marginLeft: 10,
                        color: vars.textColor,
                        fontSize: 17,
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
