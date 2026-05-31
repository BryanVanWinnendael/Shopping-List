import React from "react"
import { TextInput, TextInputProps } from "react-native"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { usePopAnimation } from "@/hooks/usePopAnimation"

type Props = TextInputProps & {
    containerStyle?: any
}

export default function PopInput({ containerStyle, onFocus, onBlur, ...props }: Props) {
    const { scale, pop, reset } = usePopAnimation()

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    return (
        <Animated.View style={[animatedStyle, containerStyle]}>
            <TextInput
                {...props}
                onFocus={(e) => {
                    pop()
                    onFocus?.(e)
                }}
                onBlur={(e) => {
                    reset()
                    onBlur?.(e)
                }}
            />
        </Animated.View>
    )
}
