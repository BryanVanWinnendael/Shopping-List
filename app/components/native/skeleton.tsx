import { useEffect } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

const PULSE_DURATION = 1100
const DIM_OPACITY = 0.45

type SkeletonProps = {
    style?: StyleProp<ViewStyle>
    /** Stagger the pulse so stacked skeletons shimmer in sequence. */
    delay?: number
}

export default function Skeleton({ style, delay = 0 }: SkeletonProps) {
    const { vars } = useThemes()
    const opacity = useSharedValue(1)

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(DIM_OPACITY, { duration: PULSE_DURATION / 2 }),
                    withTiming(1, { duration: PULSE_DURATION / 2 })
                ),
                -1
            )
        )
    }, [delay, opacity])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }))

    return (
        <Animated.View
            style={[styles.base, { backgroundColor: vars.secondaryBackgroundColor }, style, animatedStyle]}
        />
    )
}

export function ProductRowSkeleton({ index = 0 }: { index?: number }) {
    return (
        <View style={styles.row}>
            <Skeleton delay={index * 120} style={styles.rowIcon} />
            <View style={styles.rowText}>
                <Skeleton delay={index * 120 + 60} style={styles.rowTitle} />
                <Skeleton delay={index * 120 + 120} style={styles.rowSubtitle} />
            </View>
        </View>
    )
}

export function RecipeCardSkeleton({ index = 0 }: { index?: number }) {
    return (
        <View style={styles.card}>
            <Skeleton delay={index * 120} style={styles.cardImage} />
            <View style={styles.cardBody}>
                <Skeleton delay={index * 120 + 60} style={styles.cardTitle} />
                <Skeleton delay={index * 120 + 120} style={styles.cardSubtitle} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    base: {
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginVertical: 4,
        gap: 8,
    },
    rowIcon: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS_FULL,
    },
    rowText: {
        flex: 1,
        gap: 8,
        paddingVertical: 4,
    },
    rowTitle: {
        height: 16,
        width: "55%",
        borderRadius: BORDER_RADIUS_M,
    },
    rowSubtitle: {
        height: 12,
        width: "30%",
        borderRadius: BORDER_RADIUS_M,
        alignSelf: "flex-end",
    },
    card: {
        borderRadius: BORDER_RADIUS_L,
        overflow: "hidden",
        marginVertical: 4,
    },
    cardImage: {
        width: "100%",
        height: 140,
        borderRadius: BORDER_RADIUS_L,
    },
    cardBody: {
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    cardTitle: {
        height: 16,
        width: "70%",
        borderRadius: BORDER_RADIUS_M,
    },
    cardSubtitle: {
        height: 12,
        width: "40%",
        borderRadius: BORDER_RADIUS_M,
    },
})
