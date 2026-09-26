import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import { ListFilter } from "lucide-react-native"
import { View } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { GlassView } from "expo-glass-effect"
import { BORDER_RADIUS_L } from "@/lib/theme"

type Props = {
    open: () => void
    shifted?: boolean
}

export default function FilterButton({ open, shifted }: Props) {
    const { vars, theme } = useThemes()

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
                <GlassView
                    glassEffectStyle="regular"
                    isInteractive
                    colorScheme={theme === "light" ? "light" : "dark"}
                    style={{
                        flexDirection: "row",
                        borderRadius: BORDER_RADIUS_L,
                        overflow: "hidden",
                        width: 48,
                        height: 48,
                    }}
                >
                    <PressableScale
                        onPress={open}
                        style={{
                            height: 48,
                            width: 48,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <ListFilter size={20} color={vars.textColor} />
                    </PressableScale>
                </GlassView>
            </Animated.View>
        </View>
    )
}
