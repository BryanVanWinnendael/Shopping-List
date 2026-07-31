import { Text, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { ChevronDown, ListFilter } from "lucide-react-native"
import { BlurView } from "expo-blur"
import Animated, {
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import { useRecipesFilter } from "@/hooks/recipes/useRecipesFilter"
import { useRecipesStore } from "@/stores/useRecipesStore"
import useThemes from "@/hooks/themes/useThemes"
import { useCallback, useEffect } from "react"
import { SHADOW_STYLE } from "@/lib/constants"

type Props = {
    onPress: () => void
    onExpandedChange: (expanded: boolean) => void
    expanded: boolean
    setExpanded: (expanded: boolean) => void
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

export default function BottomSheetButton({ onPress, onExpandedChange, expanded, setExpanded }: Props) {
    const { vars, theme } = useThemes()
    const { newUI } = useSettingsStore()
    const { states } = useRecipesFilter()
    const { setFilter } = useRecipesStore()

    const width = useSharedValue(48)
    const blurIntensity = useSharedValue(50)

    const backgroundColorTint = theme === "light" ? "systemThickMaterialLight" : "systemThickMaterialDark"

    const animatedStyle = useAnimatedStyle(() => ({
        width: width.value,
    }))

    const animatedBlurProps = useAnimatedProps(() => ({
        intensity: blurIntensity.value,
    }))

    const toggle = useCallback(() => {
        setExpanded(!expanded)
        onExpandedChange(!expanded)
    }, [setExpanded, onExpandedChange, expanded])

    useEffect(() => {
        if (expanded) {
            width.value = withSequence(withTiming(240, { duration: 180 }), withTiming(220, { duration: 220 }))

            blurIntensity.value = withSequence(withTiming(100, { duration: 180 }), withTiming(50, { duration: 300 }))

            setFilter(true)
        } else {
            width.value = withSequence(withTiming(48, { duration: 150 }), withTiming(48, { duration: 150 }))

            blurIntensity.value = withSequence(withTiming(80, { duration: 100 }), withTiming(50, { duration: 150 }))

            setFilter(false)
        }
    }, [expanded])

    const Content = (
        <PressableScale
            onPress={toggle}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}
        >
            {expanded && (
                <PressableScale onPress={onPress} style={{ paddingRight: 10 }}>
                    <Text style={{ color: vars.textColor }}>Filtered by</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", maxWidth: 120 }}>
                        <Text style={{ color: vars.accentColor }} numberOfLines={1}>
                            {states.label}
                        </Text>
                        <ChevronDown color={vars.accentColor} size={16} />
                    </View>
                </PressableScale>
            )}

            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: expanded ? vars.accentColor : "transparent",
                    padding: expanded ? 8 : 0,
                    borderRadius: 20,
                    paddingHorizontal: expanded ? 20 : 0,
                }}
            >
                <ListFilter size={22} color={vars.textColor} style={{ transform: [{ translateX: 1 }] }} />
            </View>
        </PressableScale>
    )

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    bottom: 26,
                    right: 80,
                    zIndex: 1,
                },
                animatedStyle,
                SHADOW_STYLE,
            ]}
        >
            <View
                style={{
                    borderRadius: 100,
                    overflow: newUI ? "visible" : "hidden",
                    borderWidth: newUI ? 0 : 1,
                    borderColor: `${vars.secondaryBorderColor}50`,
                }}
            >
                {newUI ? (
                    <GlassOrBlurView
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            paddingHorizontal: expanded ? 6 : 14,
                            height: 48,
                            borderRadius: 100,
                        }}
                        backgroundColor={vars.secondaryBackgroundColor}
                        borderColor={`${vars.secondaryBorderColor}50`}
                    >
                        {Content}
                    </GlassOrBlurView>
                ) : (
                    <AnimatedBlurView
                        animatedProps={animatedBlurProps}
                        tint={backgroundColorTint}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            paddingHorizontal: expanded ? 6 : 14,
                            height: 48,
                            borderRadius: 100,
                        }}
                    >
                        {Content}
                    </AnimatedBlurView>
                )}
            </View>
        </Animated.View>
    )
}
