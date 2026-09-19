import { useCallback, useEffect } from "react"
import { Text, View } from "react-native"
import { GlassView } from "expo-glass-effect"
import { ChevronDown, ListFilter } from "lucide-react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated"
import { PressableScale } from "pressto"

import { useRecipesFilter } from "@/hooks/recipes/useRecipesFilter"
import { useRecipesStore } from "@/stores/useRecipesStore"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"

type Props = {
    onPress: () => void
    onExpandedChange: (expanded: boolean) => void
    expanded: boolean
    setExpanded: (expanded: boolean) => void
}

const AnimatedGlassView = Animated.createAnimatedComponent(GlassView)

export default function BottomSheetButton({ onPress, onExpandedChange, expanded, setExpanded }: Props) {
    const { vars, theme } = useThemes()
    const { states } = useRecipesFilter()
    const { setFilter } = useRecipesStore()

    const width = useSharedValue(48)

    const animatedStyle = useAnimatedStyle(() => ({
        width: width.value,
    }))

    const toggle = useCallback(() => {
        const nextExpanded = !expanded

        setExpanded(nextExpanded)
        onExpandedChange(nextExpanded)
    }, [expanded, setExpanded, onExpandedChange])

    useEffect(() => {
        if (expanded) {
            width.value = withSequence(withTiming(240, { duration: 180 }), withTiming(230, { duration: 220 }))

            setFilter(true)
        } else {
            width.value = withTiming(48, { duration: 180 })

            setFilter(false)
        }
    }, [expanded, setFilter])

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    bottom: 26,
                    right: 80,
                    height: 48,
                    zIndex: 1,
                },
                animatedStyle,
            ]}
        >
            <AnimatedGlassView
                glassEffectStyle="regular"
                isInteractive
                colorScheme={theme === "light" ? "light" : "dark"}
                tintColor={vars.secondaryBackgroundColor}
                style={{
                    height: 48,
                    width: "100%",
                    borderRadius: BORDER_RADIUS_FULL,
                    overflow: "hidden",
                }}
            >
                <PressableScale
                    onPress={toggle}
                    style={{
                        height: 48,
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        paddingHorizontal: expanded ? 6 : 14,
                    }}
                >
                    {expanded && (
                        <PressableScale
                            onPress={onPress}
                            style={{
                                width: 160,
                                paddingHorizontal: 12,
                                justifyContent: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: vars.textColor,
                                    fontSize: 13,
                                    fontWeight: "500",
                                }}
                            >
                                Filtered by
                            </Text>

                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    width: "100%",
                                }}
                            >
                                <Text
                                    style={{
                                        flexShrink: 1,
                                        color: vars.accentColor,
                                        fontSize: 14,
                                        fontWeight: "600",
                                    }}
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
                        style={{
                            width: expanded ? 52 : undefined,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: expanded ? vars.accentColor : "transparent",
                            paddingVertical: expanded ? 8 : 0,
                            paddingHorizontal: expanded ? 16 : 0,
                            borderRadius: BORDER_RADIUS_L,
                        }}
                    >
                        <ListFilter
                            size={22}
                            strokeWidth={2}
                            color={expanded ? "#fff" : vars.textColor}
                            style={{
                                transform: [{ translateX: 1 }],
                            }}
                        />
                    </View>
                </PressableScale>
            </AnimatedGlassView>
        </Animated.View>
    )
}
