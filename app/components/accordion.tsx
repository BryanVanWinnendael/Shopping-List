import { ReactNode } from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated"

type Props = {
    expanded: boolean
    children: ReactNode
    duration?: number
    style?: StyleProp<ViewStyle>
}

export default function Accordion({ expanded, children, duration = 400, style }: Props) {
    const contentHeight = useSharedValue(0)

    const animatedHeight = useDerivedValue(() => withTiming(expanded ? contentHeight.value : 0, { duration }))

    const animatedStyle = useAnimatedStyle(() => ({
        height: animatedHeight.value,
    }))

    return (
        <Animated.View style={[animatedStyle, { overflow: "hidden" }, style]}>
            <View
                style={{
                    position: "absolute",
                    width: "100%",
                    paddingBottom: 20,
                }}
                onLayout={(e) => {
                    contentHeight.value = e.nativeEvent.layout.height
                }}
            >
                {children}
            </View>
        </Animated.View>
    )
}
