import { useEffect } from "react"
import { Text, StyleSheet } from "react-native"
import { getTextColor } from "@/lib/theme"
import { useInteractions } from "@/stores/useInteractions"
import { useSettings } from "@/stores/useSettings"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated"
import { Toasts } from "@/types"
import { scheduleOnRN } from "react-native-worklets"

type Props = {
  message: Toasts
}

const MESSAGES: Record<Toasts, string> = {
  size: "The file is too large.",
  error: "An unexpected error occurred.",
}

export function ErrorBanner({ message }: Props) {
  const { theme } = useSettings()
  const { setError } = useInteractions()
  const textColor = getTextColor(theme)

  const translateY = useSharedValue(-20)
  const opacity = useSharedValue(0)

  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    })
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    })

    const timeout = setTimeout(() => {
      translateY.value = withTiming(-20, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      })
      opacity.value = withTiming(
        0,
        { duration: 300, easing: Easing.in(Easing.ease) },
        () => {
          scheduleOnRN(setError, null)
        },
      )
    }, 2000)

    return () => clearTimeout(timeout)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme === "light" ? "#ffd6d6" : "#662222" },
        animatedStyle,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>
        {MESSAGES[message] ?? message}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    minWidth: "90%",
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
})
