import { StyleSheet } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { getTextColor } from "@/lib/theme"
import { useInteractions } from "@/stores/useInteractions"
import { useSettings } from "@/stores/useSettings"
import { useEffect } from "react"
import { scheduleOnRN } from "react-native-worklets"

export function ListHeader() {
  const { theme, aColor } = useSettings()
  const { searchItems, items } = useInteractions()

  const textColor = getTextColor(theme)

  const isSearching = !!searchItems
  const totalItems = items ? Object.keys(items).length : 0
  const progress = useSharedValue(isSearching ? 1 : 0)

  useEffect(() => {
    progress.value = withTiming(isSearching ? 1 : 0, { duration: 300 })
  }, [isSearching])

  const countStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: -10 * progress.value }],
  }))

  const searchingStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: 10 * (1 - progress.value) }],
  }))

  const hitBottomHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
  }

  const createDotAnimation = (delay = 0) => {
    const dot = useSharedValue(0)

    useEffect(() => {
      if (isSearching) {
        dot.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(-6, {
                duration: 300,
                easing: Easing.inOut(Easing.ease),
              }),
              withTiming(
                0,
                {
                  duration: 300,
                  easing: Easing.inOut(Easing.ease),
                },
                () => {
                  scheduleOnRN(hitBottomHaptic)
                },
              ),
              withTiming(0, { duration: 300 }),
            ),
            -1,
          ),
        )
      } else {
        dot.value = 0
      }
    }, [isSearching])

    const style = useAnimatedStyle(() => ({
      transform: [{ translateY: dot.value }],
    }))

    return style
  }

  const dot1Style = createDotAnimation(0)
  const dot2Style = createDotAnimation(150)
  const dot3Style = createDotAnimation(300)

  return (
    <>
      <Animated.Text
        style={[
          styles.text,
          styles.textPosition,
          { color: textColor },
          countStyle,
        ]}
      >
        {totalItems} {totalItems === 1 ? "item" : "items"}
      </Animated.Text>

      <Animated.View style={[styles.textRow, searchingStyle]}>
        <Animated.Text style={[{ color: textColor }, styles.text]}>
          Searching for{" "}
        </Animated.Text>
        <Animated.Text
          style={[{ color: aColor, maxWidth: 150 }, styles.text]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {searchItems}{" "}
        </Animated.Text>

        <Animated.Text style={[styles.dot, dot1Style, { color: textColor }]}>
          .
        </Animated.Text>
        <Animated.Text style={[styles.dot, dot2Style, { color: textColor }]}>
          .
        </Animated.Text>
        <Animated.Text style={[styles.dot, dot3Style, { color: textColor }]}>
          .
        </Animated.Text>
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  textPosition: {
    position: "absolute",
    top: -15,
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
  },
  textRow: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    top: -15,
  },
  dot: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 1,
  },
})
