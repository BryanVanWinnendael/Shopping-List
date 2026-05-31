import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import { ListFilter } from "lucide-react-native"
import { View } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"

import GlassOrBlurView from "@/components/glassOrBlurView"

type Props = {
    open: () => void
    shifted?: boolean
}

export default function FilterButton({ open, shifted }: Props) {
    const { vars } = useThemes()

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: withTiming(shifted ? 8 : 0, { duration: 250 }),
            },
            {
                translateY: withTiming(shifted ? 6 : 0, { duration: 250 }),
            },
            {
                scale: withTiming(shifted ? 0.96 : 1, { duration: 250 }),
            },
        ],
    }))

    return (
        <View
            style={{
                position: "absolute",
                bottom: 24,
                right: 24,
                zIndex: 1,
            }}
        >
            <Animated.View style={animatedStyle}>
                <GlassOrBlurView
                    style={{
                        flexDirection: "row",
                        borderRadius: 26,
                        overflow: "hidden",
                        borderWidth: 1,
                    }}
                    backgroundColor={vars.secondaryBackgroundColor}
                    borderColor={`${vars.secondaryBorderColor}50`}
                >
                    <PressableScale
                        onPress={() => {
                            open()
                        }}
                        style={{
                            height: 52,
                            width: 52,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <ListFilter size={20} color={vars.textColor} />
                    </PressableScale>
                </GlassOrBlurView>
            </Animated.View>
        </View>
    )
}
