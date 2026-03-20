import { useState, useEffect } from "react"
import { View, ImageBackground, StyleSheet } from "react-native"
import CachedImage, { CacheManager } from "expo-cached-image"
import * as Crypto from "expo-crypto"

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
  expiresIn = 604800, // 7 days
}: Props) {
  const [showLarge, setShowLarge] = useState(false)
  const [cacheKey, setCacheKey] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const hashKey = async () => {
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA1,
        large,
      )
      if (active) setCacheKey(hash)
    }
    hashKey()
    return () => {
      active = false
    }
  }, [large])

  useEffect(() => {
    if (!cacheKey) return
    let active = true

    const loadLarge = async () => {
      try {
        const cached = await CacheManager.getCachedUri({ key: cacheKey })
        if (cached && active) {
          setShowLarge(true)
          return
        }

        const img = new Image()
        img.src = large
        img.onload = () => active && setShowLarge(true)
      } catch {
        console.log("Failed to load large image")
        if (active) setShowLarge(true)
      }
    }

    loadLarge()
    return () => {
      active = false
    }
  }, [cacheKey, large])

  return (
    <View style={[style, { overflow: "hidden" }]}>
      {/* Small placeholder */}
      <ImageBackground
        source={{ uri: small }}
        style={StyleSheet.absoluteFill}
        resizeMode={resizeMode}
      />

      {/* Large cached image */}
      {cacheKey && showLarge && large !== "remove" && (
        <CachedImage
          key={cacheKey}
          source={{
            uri: large || "",
            expiresIn,
          }}
          onError={() => {}}
          cacheKey={cacheKey}
          resizeMode={resizeMode}
          style={StyleSheet.absoluteFill}
        />
      )}
    </View>
  )
}
