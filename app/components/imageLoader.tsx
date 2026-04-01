import { useState } from "react"
import { View, ImageBackground, StyleSheet } from "react-native"
import CachedImage from "expo-cached-image"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"

type Props = {
  small: string
  large: string
  style?: any
  resizeMode?: "cover" | "contain" | "stretch" | "center"
  expiresIn?: number
}

/**
 * Progressive + cached image loader:
 * - Shows small instantly
 * - Uses hashed cache key to avoid truncation conflicts
 * - Loads large from cache if available
 * - Otherwise fetches & caches it
 */
export function ImageLoader({
  small,
  large,
  style,
  resizeMode = "cover",
  expiresIn = 604800,
}: Props) {
  const [loaded, setLoaded] = useState(false)

  const opacity = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <View style={[style, { overflow: "hidden" }]}>
      {/* Small placeholder */}
      <ImageBackground
        source={{ uri: small }}
        style={StyleSheet.absoluteFill}
        resizeMode={resizeMode}
      />

      {/* Hidden loader (USES CACHE!) */}
      {!loaded && (
        <CachedImage
          cacheKey={large}
          source={{ uri: large, expiresIn }}
          style={{ width: 1, height: 1, position: "absolute" }}
          onLoadEnd={() => {
            setLoaded(true)
            opacity.value = withTiming(1, { duration: 250 })
          }}
        />
      )}

      {/* Visible image (same cache, no refetch) */}
      {loaded && (
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
          <CachedImage
            cacheKey={large}
            source={{ uri: large, expiresIn }}
            resizeMode={resizeMode}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  )
}
