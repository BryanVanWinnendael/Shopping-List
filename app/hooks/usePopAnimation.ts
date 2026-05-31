import { useSharedValue, withSequence, withTiming } from "react-native-reanimated"

export function usePopAnimation() {
    const scale = useSharedValue(1)

    const pop = () => {
        scale.value = withSequence(withTiming(1.03, { duration: 120 }), withTiming(1, { duration: 180 }))
    }

    const reset = () => {
        scale.value = withTiming(1, { duration: 150 })
    }

    return { scale, pop, reset }
}
