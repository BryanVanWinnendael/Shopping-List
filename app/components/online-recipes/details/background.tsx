import { StyleSheet } from "react-native"
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"
import CustomImage from "@/components/customImage"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"

type Props = {
    recipe: OnlineRecipeDetails | null
    scrollY: SharedValue<number>
}

const IMAGE_HEIGHT = 240
const PARALLAX_OFFSET = 80

export default function Background({ recipe, scrollY }: Props) {
    const imageUrl = recipe?.image

    const containerStyle = useAnimatedStyle(() => {
        const pullDown = Math.max(0, -scrollY.value)

        return {
            height: interpolate(scrollY.value, [0, IMAGE_HEIGHT], [IMAGE_HEIGHT, 0], Extrapolation.CLAMP) + pullDown,
        }
    })

    const imageStyle = useAnimatedStyle(() => {
        const pullDown = Math.max(0, -scrollY.value)

        return {
            height: IMAGE_HEIGHT + pullDown,
            transform: [
                {
                    translateY: interpolate(
                        scrollY.value,
                        [0, IMAGE_HEIGHT],
                        [0, -PARALLAX_OFFSET],
                        Extrapolation.CLAMP
                    ),
                },
            ],
        }
    })

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <Animated.View style={[styles.image, imageStyle]}>
                {!!imageUrl && <CustomImage url={imageUrl} style={StyleSheet.absoluteFill} />}
            </Animated.View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        overflow: "hidden",
        zIndex: 10,
    },
    image: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: IMAGE_HEIGHT,
    },
})
