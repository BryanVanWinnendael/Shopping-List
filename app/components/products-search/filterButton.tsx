import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import { ListFilter } from "lucide-react-native"
import { StyleSheet, Text, View } from "react-native"
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withTiming } from "react-native-reanimated"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { BORDER_RADIUS_FULL, DOCK_BOTTOM, DOCK_SIDE, FAB_ICON_SIZE, FAB_SIZE } from "@/lib/theme"

type Props = {
    open: () => void
    count?: number
    shifted?: boolean
}

export default function FilterButton({ open, count = 0, shifted }: Props) {
    const { vars } = useThemes()

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: withTiming(shifted ? 8 : 0, { duration: 250 }),
            },
            {
                translateY: withTiming(shifted ? 6 : 0, { duration: 250 }),
            },
            {
                scale: withTiming(shifted ? 0.96 : 1, { duration: 250 }),
            },
        ],
    }))

    return (
        <View style={styles.wrapper}>
            <Animated.View style={animatedStyle}>
                <LiquidGlassView style={styles.glass} isInteractive>
                    <PressableScale onPress={open} style={styles.button}>
                        <ListFilter size={FAB_ICON_SIZE} color={vars.textColor} />
                    </PressableScale>
                </LiquidGlassView>

                {count > 0 && (
                    <Animated.View
                        entering={FadeIn.duration(120)}
                        exiting={FadeOut.duration(120)}
                        style={[styles.badge, { backgroundColor: vars.accentColor }]}
                    >
                        <Text style={styles.badgeText}>{count}</Text>
                    </Animated.View>
                )}
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        bottom: DOCK_BOTTOM,
        right: DOCK_SIDE,
        zIndex: 1,
    },
    glass: {
        flexDirection: "row",
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        width: FAB_SIZE,
        height: FAB_SIZE,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    button: {
        height: FAB_SIZE,
        width: FAB_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -4,
        minWidth: 20,
        height: 20,
        borderRadius: BORDER_RADIUS_FULL,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5,
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
})
