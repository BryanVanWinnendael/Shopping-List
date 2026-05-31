import { Image, StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import CachedImage, { CacheManager } from "expo-cached-image"
import { File } from "expo-file-system"

type Props = {
    small: string
    large: string
    style?: any
    resizeMode?: "cover" | "contain" | "stretch" | "center"
}

export default function ImageLoader({ small, large, style, resizeMode = "cover" }: Props) {
    const opacity = useSharedValue(0)

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }))

    const clearCache = async () => {
        try {
            const metadata = await CacheManager.getMetadata({ key: large })

            if (metadata?.uri) {
                const file = new File(metadata.uri)

                if (file.exists) {
                    file.delete()
                }
            }
        } catch (e) {
            console.error("Image could not be found", e)
        }
    }

    return (
        <View style={[style, { overflow: "hidden" }]}>
            {large.includes("large") ? (
                <>
                    <Image
                        source={{ uri: small }}
                        style={StyleSheet.absoluteFill}
                        resizeMode={resizeMode}
                        blurRadius={1}
                        onError={clearCache}
                    />
                    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                        <CachedImage
                            source={{ uri: large }}
                            cacheKey={large}
                            style={StyleSheet.absoluteFill}
                            resizeMode={resizeMode}
                            onLoad={() => {
                                opacity.value = withTiming(1, {
                                    duration: 250,
                                })
                            }}
                            onError={clearCache}
                        />
                    </Animated.View>
                </>
            ) : (
                <Image source={{ uri: small }} style={StyleSheet.absoluteFill} resizeMode={resizeMode} />
            )}
        </View>
    )
}
