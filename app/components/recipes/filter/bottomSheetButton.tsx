import { useState } from "react"
import { Text, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { ChevronDown, ListFilter } from "lucide-react-native"
import { BlurView } from "expo-blur"
import Animated, {
    interpolate,
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

type Props = {
    onPress: () => void
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

export default function BottomSheetButton({ onPress }: Props) {
    const { vars, theme } = useThemes()
    const { newUI } = useSettingsStore()
    const { states } = useRecipesFilter()
    const { setFilter } = useRecipesStore()

    const width = useSharedValue(48)
    const blurIntensity = useSharedValue(50)

    const [expanded, setExpanded] = useState(false)

    const backgroundColorTint = theme === "light" ? "systemThickMaterialLight" : "systemThickMaterialDark"

    const animatedStyle = useAnimatedStyle(() => ({
        width: width.value,
        borderRadius: interpolate(width.value, [48, 220], [24, 200]),
    }))

    const animatedBlurProps = useAnimatedProps(() => ({
        intensity: blurIntensity.value,
    }))

    const toggle = () => {
        setExpanded((prev) => !prev)

        if (!expanded) {
            width.value = withSequence(withTiming(220, { duration: 180 }), withTiming(200, { duration: 220 }))
            blurIntensity.value = withSequence(withTiming(100, { duration: 180 }), withTiming(50, { duration: 300 }))
            setFilter(true)
        } else {
            width.value = withSequence(withTiming(40, { duration: 150 }), withTiming(48, { duration: 150 }))
            blurIntensity.value = withSequence(withTiming(80, { duration: 100 }), withTiming(50, { duration: 150 }))
            setFilter(false)
        }
    }

    const Content = (
        <PressableScale onPress={toggle} style={{ flexDirection: "row", alignItems: "center" }}>
            {expanded && (
                <PressableScale onPress={onPress} style={{ paddingRight: 12 }}>
                    <Text style={{ color: vars.textColor }}>Filtered by</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", maxWidth: 100 }}>
                        <Text style={{ color: vars.accentColor }} numberOfLines={1}>
                            {states.label}
                        </Text>
                        <ChevronDown color={vars.accentColor} size={16} />
                    </View>
                </PressableScale>
            )}

            <View
                style={{
                    backgroundColor: expanded ? vars.accentColor : "transparent",
                    padding: expanded ? 8 : 0,
                    borderRadius: 20,
                    paddingHorizontal: expanded ? 20 : 0,
                }}
            >
                <ListFilter size={22} color={vars.textColor} />
            </View>
        </PressableScale>
    )

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    bottom: 30,
                    right: 80,
                    overflow: "hidden",
                    width: 48,
                    borderRadius: 100,
                    borderWidth: newUI ? 0 : 1,
                    borderColor: vars.secondaryBorderColor,
                    height: 48,
                    zIndex: 1,
                },
                animatedStyle,
            ]}
        >
            {newUI ? (
                <GlassOrBlurView
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        paddingHorizontal: expanded ? 6 : 12,
                        height: 48,
                    }}
                    borderRadius={100}
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
                        paddingHorizontal: expanded ? 6 : 12,
                        height: 48,
                    }}
                >
                    {Content}
                </AnimatedBlurView>
            )}
        </Animated.View>
    )
}
