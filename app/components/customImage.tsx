import { PressableScale } from "pressto"
import { Modal, StyleProp, StyleSheet, useWindowDimensions, View } from "react-native"
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

const MIN_SCALE = 1
const MAX_SCALE = 4
const DOUBLE_TAP_SCALE = 2

const SPRING_CONFIG = {
    damping: 18,
    stiffness: 220,
    mass: 0.7,
}

export default function CustomImage({ url, height, width, style }: Props) {
    const [showImage, setShowImage] = useState(false)
    const { width: screenWidth, height: screenHeight } = useWindowDimensions()

    // Modal animation
    const backdropOpacity = useSharedValue(0)
    const modalScale = useSharedValue(0.85)

    // Image zoom
    const imageScale = useSharedValue(1)
    const savedScale = useSharedValue(1)

    // Image translation
    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)
    const savedTranslateX = useSharedValue(0)
    const savedTranslateY = useSharedValue(0)

    // Swipe-to-dismiss scale
    const dismissScale = useSharedValue(1)

    const openModal = () => {
        setShowImage(true)

        backdropOpacity.value = 0
        modalScale.value = 0.85

        imageScale.value = 1
        savedScale.value = 1

        translateX.value = 0
        translateY.value = 0

        savedTranslateX.value = 0
        savedTranslateY.value = 0

        dismissScale.value = 1

        backdropOpacity.value = withTiming(1, {
            duration: 180,
        })

        modalScale.value = withSpring(1, {
            damping: 18,
            stiffness: 260,
            mass: 0.7,
        })
    }

    const closeModal = () => {
        backdropOpacity.value = withTiming(0, {
            duration: 140,
        })

        modalScale.value = withTiming(
            0.9,
            {
                duration: 140,
            },
            (finished) => {
                if (finished) {
                    scheduleOnRN(setShowImage, false)
                }
            }
        )

        imageScale.value = withTiming(1, {
            duration: 140,
        })

        translateX.value = withTiming(0, {
            duration: 140,
        })

        translateY.value = withTiming(0, {
            duration: 140,
        })

        dismissScale.value = withTiming(1, {
            duration: 140,
        })

        savedScale.value = 1
        savedTranslateX.value = 0
        savedTranslateY.value = 0
    }

    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            savedScale.value = imageScale.value
            savedTranslateX.value = translateX.value
            savedTranslateY.value = translateY.value
        })
        .onUpdate((event) => {
            const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.value * event.scale))

            const scaleChange = nextScale / Math.max(savedScale.value, 0.001)

            // Convert the touch location from the fullscreen backdrop
            // to a point relative to the centered image.
            const localFocalX = event.focalX - screenWidth / 2
            const localFocalY = event.focalY - screenHeight / 2

            imageScale.value = nextScale

            translateX.value = localFocalX * (1 - scaleChange) + savedTranslateX.value * scaleChange

            translateY.value = localFocalY * (1 - scaleChange) + savedTranslateY.value * scaleChange
        })
        .onEnd(() => {
            if (imageScale.value < 1.05) {
                imageScale.value = withSpring(1, SPRING_CONFIG)
                translateX.value = withSpring(0, SPRING_CONFIG)
                translateY.value = withSpring(0, SPRING_CONFIG)

                savedScale.value = 1
                savedTranslateX.value = 0
                savedTranslateY.value = 0

                return
            }

            savedScale.value = imageScale.value
            savedTranslateX.value = translateX.value
            savedTranslateY.value = translateY.value
        })

    const panGesture = Gesture.Pan()
        .onStart(() => {
            savedTranslateX.value = translateX.value
            savedTranslateY.value = translateY.value
        })
        .onUpdate((event) => {
            const currentScale = imageScale.value

            if (currentScale > 1.01) {
                translateX.value = savedTranslateX.value + event.translationX

                translateY.value = savedTranslateY.value + event.translationY

                return
            }

            translateX.value = 0
            translateY.value = event.translationY

            const distance = Math.abs(event.translationY)

            dismissScale.value = Math.max(0.82, 1 - distance / 1200)

            backdropOpacity.value = Math.max(0.15, 1 - distance / 500)
        })
        .onEnd((event) => {
            const currentScale = imageScale.value

            if (currentScale > 1.01) {
                savedTranslateX.value = translateX.value
                savedTranslateY.value = translateY.value
                return
            }

            const shouldClose = Math.abs(event.translationY) > 140 || Math.abs(event.velocityY) > 1200

            if (shouldClose) {
                const destination = event.translationY > 0 ? 900 : -900

                backdropOpacity.value = withTiming(0, {
                    duration: 140,
                })

                dismissScale.value = withTiming(0.85, {
                    duration: 160,
                })

                translateY.value = withTiming(
                    destination,
                    {
                        duration: 160,
                    },
                    (finished) => {
                        if (finished) {
                            scheduleOnRN(setShowImage, false)
                        }
                    }
                )

                return
            }

            translateX.value = withSpring(0, SPRING_CONFIG)
            translateY.value = withSpring(0, SPRING_CONFIG)
            dismissScale.value = withSpring(1, SPRING_CONFIG)

            backdropOpacity.value = withTiming(1, {
                duration: 140,
            })

            savedTranslateX.value = 0
            savedTranslateY.value = 0
        })

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onEnd((event) => {
            if (imageScale.value > 1.05) {
                imageScale.value = withSpring(1, SPRING_CONFIG)
                translateX.value = withSpring(0, SPRING_CONFIG)
                translateY.value = withSpring(0, SPRING_CONFIG)

                savedScale.value = 1
                savedTranslateX.value = 0
                savedTranslateY.value = 0

                return
            }

            const targetScale = DOUBLE_TAP_SCALE
            const scaleChange = targetScale / Math.max(imageScale.value, 0.001)

            // Convert the double-tap point to image-centered coordinates.
            const localTapX = event.x - screenWidth / 2
            const localTapY = event.y - screenHeight / 2

            const targetTranslateX = localTapX * (1 - scaleChange) + translateX.value * scaleChange

            const targetTranslateY = localTapY * (1 - scaleChange) + translateY.value * scaleChange

            translateX.value = withSpring(targetTranslateX, SPRING_CONFIG)

            translateY.value = withSpring(targetTranslateY, SPRING_CONFIG)

            imageScale.value = withSpring(targetScale, SPRING_CONFIG)

            savedScale.value = targetScale
            savedTranslateX.value = targetTranslateX
            savedTranslateY.value = targetTranslateY
        })

    // Simultaneous avoids waiting for the double-tap recognizer to fail
    // before pinch updates begin.
    const zoomGesture = Gesture.Simultaneous(pinchGesture, panGesture)

    const gesture = Gesture.Simultaneous(zoomGesture, doubleTapGesture)

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }))

    const imageStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: translateX.value,
            },
            {
                translateY: translateY.value,
            },
            {
                scale: modalScale.value * imageScale.value * dismissScale.value,
            },
        ],
    }))

    return (
        <>
            <PressableScale onPress={openModal} style={style}>
                <Image
                    source={url}
                    style={[
                        {
                            height,
                            width,
                        },
                        style,
                    ]}
                    placeholder={url.replace("large-", "small-")}
                    placeholderContentFit="cover"
                    contentFit="cover"
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
                                    placeholderContentFit="contain"
                                    contentFit="contain"
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
        backgroundColor: "rgba(0, 0, 0, 0.96)",
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
        height: "80%",
        justifyContent: "center",
        alignItems: "center",
    },
    modalImage: {
        width: "100%",
        height: "100%",
    },
})
