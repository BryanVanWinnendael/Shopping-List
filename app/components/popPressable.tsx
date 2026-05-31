import React from "react"
import { Pressable, ViewStyle } from "react-native"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { usePopAnimation } from "@/hooks/usePopAnimation"

type Props = {
    children: React.ReactNode
    onPress?: () => void
    style?: ViewStyle
}

const APressable = Animated.createAnimatedComponent(Pressable)

export default function PopPressable({ children, onPress, style }: Props) {
    const { scale, pop } = usePopAnimation()

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    return (
        <APressable
            onPress={() => {
                pop()
                onPress?.()
            }}
            style={[animatedStyle, style]}
        >
            {children}
        </APressable>
    )
}
