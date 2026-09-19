import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { ChevronDown } from "lucide-react-native"
import { PressableScale } from "pressto"
import { useRecipesStore } from "@/stores/useRecipesStore"
import useThemes from "@/hooks/themes/useThemes"
import useRecipesCountries from "@/hooks/recipes/useRecipesCountries"
import { BORDER_RADIUS_L } from "@/lib/theme"

export default function CountriesFilter() {
    const { vars } = useThemes()
    const { states, actions } = useRecipesCountries()
    const { setActiveFilter, activeFilter } = useRecipesStore()
    const animation = useSharedValue(0)

    const [open, setOpen] = useState(false)

    const toggleDropdown = async () => {
        if (!open) await actions.fetchCountries()

        setOpen((prev) => !prev)
        animation.value = withTiming(open ? 0 : 1, { duration: 200 })
    }

    const animatedStyle = useAnimatedStyle(() => {
        const height = interpolate(animation.value, [0, 1], [0, states.countries.length * 40])
        return {
            height,
            opacity: animation.value,
        }
    })

    const handleSelect = async (country: string) => {
        await setActiveFilter({ ...activeFilter, country })
        toggleDropdown()
    }

    return (
        <View style={styles.container}>
            <PressableScale
                style={[
                    styles.selector,
                    {
                        borderColor: vars.secondaryBorderColor,
                        backgroundColor: vars.secondaryBackgroundColor,
                    },
                ]}
                onPress={toggleDropdown}
            >
                <Text
                    style={{
                        color: vars.textColor,
                    }}
                >
                    {activeFilter.country || "Any"}
                </Text>
                <ChevronDown size={18} color={vars.textColor} />
            </PressableScale>

            <Animated.View
                style={[
                    styles.dropdown,
                    animatedStyle,
                    {
                        backgroundColor: vars.secondaryBackgroundColor,
                        borderWidth: 1,
                        borderColor: vars.secondaryBorderColor,
                    },
                ]}
            >
                <View
                    style={{
                        flex: 1,
                        borderRadius: BORDER_RADIUS_L,
                    }}
                >
                    <View>
                        {states.countries.map((country) => (
                            <PressableScale
                                key={country}
                                onPress={() => handleSelect(country)}
                                style={[styles.option, { backgroundColor: vars.secondaryBackgroundColor }]}
                            >
                                <Text style={{ color: vars.textColor }}>{country}</Text>
                            </PressableScale>
                        ))}
                    </View>
                </View>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        position: "relative",
    },
    selector: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS_L,
    },
    dropdown: {
        overflow: "hidden",
        borderRadius: BORDER_RADIUS_L,
        marginTop: 4,
    },
    option: {
        paddingHorizontal: 12,
        height: 40,
        justifyContent: "center",
    },
})
