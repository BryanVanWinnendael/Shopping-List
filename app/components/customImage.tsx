import { PressableScale } from "pressto"
import { Modal, StyleProp, StyleSheet, View } from "react-native"
import { useState } from "react"
import { scheduleOnRN } from "react-native-worklets"
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { Image, ImageStyle } from "expo-image"

type Props = {
    url: string
    height?: number
    width?: number
    style?: StyleProp<ImageStyle>
}

export default function CustomImage({ url, height, width, style }: Props) {
    const [showImage, setShowImage] = useState(false)

    const backdropOpacity = useSharedValue(0)

    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)

    const scale = useSharedValue(0.85)
    const imageScale = useSharedValue(0.85)

    const openModal = () => {
        setShowImage(true)

        backdropOpacity.value = 0
        translateX.value = 0
        translateY.value = 0

        scale.value = 0.85
        imageScale.value = 0.85

        backdropOpacity.value = withTiming(1, { duration: 180 })

        scale.value = withSpring(1, {
            damping: 18,
            stiffness: 260,
            mass: 0.7,
            overshootClamping: false,
        })

        imageScale.value = withSpring(1, {
            damping: 14,
            stiffness: 220,
            mass: 0.6,
        })
    }

    const closeModal = () => {
        backdropOpacity.value = withTiming(0, { duration: 140 })

        imageScale.value = withTiming(0.9, { duration: 140 })

        scale.value = withTiming(0.9, { duration: 140 }, (finished) => {
            if (finished) scheduleOnRN(setShowImage, false)
        })
    }

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            translateY.value = event.translationY
            translateX.value = event.translationX

            const distance = Math.abs(event.translationY)

            scale.value = Math.max(0.85, 1 - distance / 1000)

            backdropOpacity.value = Math.max(0.2, 1 - distance / 500)
        })
        .onEnd((event) => {
            const shouldClose = Math.abs(event.translationY) > 140 || Math.abs(event.velocityY) > 1200

            if (shouldClose) {
                backdropOpacity.value = withTiming(0, { duration: 140 })

                translateY.value = withTiming(event.translationY > 0 ? 900 : -900, { duration: 160 }, (finished) => {
                    if (finished) scheduleOnRN(setShowImage, false)
                })
                return
            }

            translateX.value = withTiming(0, { duration: 140 })
            translateY.value = withTiming(0, { duration: 140 })

            scale.value = withTiming(1, { duration: 140 })

            backdropOpacity.value = withTiming(1, { duration: 140 })
        })

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }))

    const imageStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value * imageScale.value },
        ],
    }))

    return (
        <>
            <PressableScale onPress={openModal} style={style}>
                <Image
                    source={url}
                    style={[{ height, width }, style]}
                    placeholder={url.replace("large-", "small-")}
                    placeholderContentFit={"cover"}
                    contentFit={"cover"}
                    transition={250}
                />
            </PressableScale>

            <Modal
                transparent
                visible={showImage}
                animationType="none"
                statusBarTranslucent
                onRequestClose={closeModal}
            >
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[styles.backdrop, backdropStyle]}>
                        <View style={styles.centerContainer}>
                            <Animated.View style={[styles.imageWrapper, imageStyle]}>
                                <Image
                                    source={url}
                                    style={styles.modalImage}
                                    placeholder={url.replace("large-", "small-")}
                                    placeholderContentFit={"contain"}
                                    contentFit={"contain"}
                                    transition={250}
                                />
                            </Animated.View>
                        </View>
                    </Animated.View>
                </GestureDetector>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.96)",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 60,
    },
    imageWrapper: {
        width: "100%",
        maxHeight: "80%",
        justifyContent: "center",
        alignItems: "center",
    },
    modalImage: {
        width: "100%",
        height: "100%",
    },
})
