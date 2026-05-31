import { PressableScale } from "pressto"
import { useEffect, useState } from "react"
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { MEAL_TYPES } from "@/lib/constants"
import { MealType } from "@/types/recipes"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    value: MealType
    onChange: (val: MealType) => void
}

export default function MealTypeSegment({ value, onChange }: Props) {
    const { vars } = useThemes()
    const translateX = useSharedValue(0)

    const [containerWidth, setContainerWidth] = useState(0)

    const selectedIndex = MEAL_TYPES.findIndex((t) => t.toLowerCase() === value.toLowerCase())

    useEffect(() => {
        if (containerWidth === 0) return
        const segmentWidth = containerWidth / MEAL_TYPES.length
        translateX.value = withSpring(segmentWidth * selectedIndex, {
            stiffness: 500,
            damping: 70,
        })
    }, [selectedIndex, containerWidth])

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }))

    const onLayout = (event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width)
    }

    return (
        <View
            style={[
                styles.container,
                { borderColor: vars.secondaryBorderColor, backgroundColor: vars.secondaryBackgroundColor },
            ]}
            onLayout={onLayout}
        >
            {containerWidth > 0 && (
                <Animated.View
                    style={[
                        styles.indicator,
                        {
                            width: containerWidth / MEAL_TYPES.length,
                            backgroundColor: vars.backgroundColor,
                        },
                        indicatorStyle,
                    ]}
                />
            )}
            {MEAL_TYPES.map((type, _) => {
                return (
                    <PressableScale key={type} onPress={() => onChange(type)} style={styles.button}>
                        <Text
                            ellipsizeMode="tail"
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                                textAlign: "center",
                            }}
                        >
                            {type}
                        </Text>
                    </PressableScale>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        borderRadius: 24,
        borderWidth: 1,
        overflow: "hidden",
        position: "relative",
        height: 40,
    },
    indicator: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        borderRadius: 24,
    },
    button: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
})
