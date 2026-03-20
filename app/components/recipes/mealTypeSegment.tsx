import { PressableScale } from "pressto"
import { useEffect, useState } from "react"
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"
import { MEAL_TYPES } from "@/lib/constants"
import { getBackgroundColor, getBorderColor, getTextColor } from "@/lib/theme"
import { MealType, Theme } from "@/types"

type Props = {
  value: MealType
  onChange: (val: MealType) => void
  theme: Theme
}

export function MealTypeSegment({ value, onChange, theme }: Props) {
  const [containerWidth, setContainerWidth] = useState(0)
  const translateX = useSharedValue(0)

  const backgroundColor = getBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

  const selectedIndex = MEAL_TYPES.findIndex(
    (t) => t.toLowerCase() === value.toLowerCase(),
  )

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
      style={[styles.container, { borderColor: borderColor }]}
      onLayout={onLayout}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            {
              width: containerWidth / MEAL_TYPES.length,
              backgroundColor: backgroundColor,
            },
            indicatorStyle,
          ]}
        />
      )}
      {MEAL_TYPES.map((type, _) => {
        return (
          <PressableScale
            key={type}
            onPress={() => onChange(type)}
            style={styles.button}
          >
            <Text
              ellipsizeMode="tail"
              style={{
                color: textColor,
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
    borderRadius: 8,
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
    borderRadius: 8,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
