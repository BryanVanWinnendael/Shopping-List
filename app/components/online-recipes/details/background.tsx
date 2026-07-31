import { StyleSheet } from "react-native"
import CustomImage from "@/components/customImage"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"

type Props = {
    recipe: OnlineRecipeDetails | null
    scrollY: SharedValue<number>
}

export default function Background({ recipe, scrollY }: Props) {
    const containerStyle = useAnimatedStyle(() => {
        const pullDown = Math.max(0, -scrollY.value)

        return {
            height: interpolate(scrollY.value, [0, 240], [240, 0], Extrapolation.CLAMP) + pullDown,
        }
    })

    const imageStyle = useAnimatedStyle(() => {
        const pullDown = Math.max(0, -scrollY.value)

        return {
            height: 240 + pullDown,
            transform: [
                {
                    translateY: interpolate(scrollY.value, [0, 240], [0, -80], Extrapolation.CLAMP),
                },
            ],
        }
    })

    return (
        <Animated.View pointerEvents="none" style={[styles.container, containerStyle]}>
            <Animated.View pointerEvents="none" style={[styles.image, imageStyle]}>
                {recipe?.image && <CustomImage url={recipe?.image} style={StyleSheet.absoluteFill} />}
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
    },
    image: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: 240,
    },
})
