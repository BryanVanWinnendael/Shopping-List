import { useCallback, useEffect } from "react"
import { StyleSheet, Text, useWindowDimensions, View } from "react-native"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { ChevronDown, ListFilter } from "lucide-react-native"
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated"
import { PressableScale } from "pressto"

import { useRecipesFilter } from "@/hooks/recipes/useRecipesFilter"
import { useRecipesStore } from "@/stores/useRecipesStore"
import useThemes from "@/hooks/themes/useThemes"
import {
    BORDER_RADIUS_FULL,
    BORDER_RADIUS_L,
    DOCK_BOTTOM,
    DOCK_GAP,
    DOCK_SIDE,
    FAB_ICON_SIZE,
    FAB_SIZE,
} from "@/lib/theme"

type Props = {
    onPress: () => void
    onExpandedChange: (expanded: boolean) => void
    expanded: boolean
    setExpanded: (expanded: boolean) => void
}

// Horizontal space taken once expanded: left margin + search circle + gap on the
// left of this bar, and the create FAB + gap on its right.
const RESERVED = DOCK_SIDE * 2 + FAB_SIZE * 2 + DOCK_GAP * 2
const MIN_EXPANDED_WIDTH = 160

export default function BottomSheetButton({ onPress, onExpandedChange, expanded, setExpanded }: Props) {
    const { vars } = useThemes()
    const { states } = useRecipesFilter()
    const { setFilter } = useRecipesStore()
    const { width } = useWindowDimensions()

    const expandedWidth = Math.max(MIN_EXPANDED_WIDTH, width - RESERVED)

    const barWidth = useSharedValue(FAB_SIZE)

    const animatedStyle = useAnimatedStyle(() => ({
        width: barWidth.value,
    }))

    const toggle = useCallback(() => {
        const nextExpanded = !expanded

        setExpanded(nextExpanded)
        onExpandedChange(nextExpanded)
    }, [expanded, setExpanded, onExpandedChange])

    useEffect(() => {
        if (expanded) {
            barWidth.value = withSequence(
                withTiming(expandedWidth + 8, { duration: 180 }),
                withTiming(expandedWidth, { duration: 220 })
            )

            setFilter(true)
        } else {
            barWidth.value = withTiming(FAB_SIZE, { duration: 180 })

            setFilter(false)
        }
    }, [expanded, expandedWidth, setFilter, barWidth])

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <LiquidGlassView style={styles.glass} isInteractive>
                <PressableScale
                    onPress={toggle}
                    style={[
                        styles.toggle,
                        {
                            paddingHorizontal: expanded ? 6 : 14,
                        },
                    ]}
                >
                    {expanded && (
                        <PressableScale onPress={onPress} style={styles.labelButton}>
                            <Text
                                style={[styles.filteredBy, { color: vars.textColor }]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                Filtered by
                            </Text>

                            <View style={styles.labelRow}>
                                <Text
                                    style={[styles.labelText, { color: vars.accentColor }]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {states.label}
                                </Text>

                                <ChevronDown color={vars.accentColor} size={16} strokeWidth={2.5} />
                            </View>
                        </PressableScale>
                    )}

                    <View
                        style={[
                            styles.iconWrapper,
                            {
                                width: expanded ? 52 : undefined,
                                backgroundColor: expanded ? vars.accentColor : "transparent",
                                paddingVertical: expanded ? 8 : 0,
                                paddingHorizontal: expanded ? 16 : 0,
                            },
                        ]}
                    >
                        <ListFilter
                            size={FAB_ICON_SIZE}
                            strokeWidth={2}
                            color={expanded ? "#fff" : vars.textColor}
                            style={styles.icon}
                        />
                    </View>
                </PressableScale>
            </LiquidGlassView>

            {!expanded && states.count > 0 && (
                <Animated.View
                    entering={FadeIn.duration(120)}
                    exiting={FadeOut.duration(120)}
                    style={[styles.badge, { backgroundColor: vars.accentColor }]}
                >
                    <Text style={styles.badgeText}>{states.count}</Text>
                </Animated.View>
            )}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: DOCK_BOTTOM,
        right: DOCK_SIDE + FAB_SIZE + DOCK_GAP,
        height: FAB_SIZE,
        zIndex: 1,
    },
    glass: {
        height: FAB_SIZE,
        width: "100%",
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    toggle: {
        height: FAB_SIZE,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    labelButton: {
        flex: 1,
        paddingHorizontal: 12,
        justifyContent: "center",
    },
    filteredBy: {
        fontSize: 13,
        fontWeight: "500",
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    labelText: {
        flexShrink: 1,
        fontSize: 14,
        fontWeight: "600",
    },
    iconWrapper: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: BORDER_RADIUS_L,
    },
    icon: {
        transform: [{ translateX: 1 }],
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
