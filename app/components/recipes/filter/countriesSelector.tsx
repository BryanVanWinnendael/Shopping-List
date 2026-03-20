import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList } from "react-native"
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated"
import { ChevronDown } from "lucide-react-native"
import { useSettings } from "@/stores/useSettings"
import { getBackgroundColor, getBorderColor, getTextColor } from "@/lib/theme"
import { getRecipesCountries } from "@/lib/recipes"
import { PressableScale } from "pressto"
import { useRecipes } from "@/stores/useRecipes"

export function CountriesSelector() {
  const { theme } = useSettings()
  const { setActiveFilter, activeFilter } = useRecipes()
  const animation = useSharedValue(0)

  const [options, setOptions] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  const backgroundColor = getBackgroundColor(theme)
  const textColor = getTextColor(theme)
  const borderColor = getBorderColor(theme)

  const toggleDropdown = () => {
    setOpen((prev) => !prev)
    animation.value = withTiming(open ? 0 : 1, { duration: 200 })
  }

  const animatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animation.value,
      [0, 1],
      [0, options.length * 40],
    )
    return {
      height,
      opacity: animation.value,
    }
  })

  const handleSelect = (country: string) => {
    setActiveFilter({ ...activeFilter, country })
    toggleDropdown()
  }

  useEffect(() => {
    const fetchCountries = async () => {
      const countries = await getRecipesCountries()

      const filteredCountries = countries.filter(
        (country) => country && country.trim() !== "",
      )

      setOptions(["Any", ...filteredCountries])
    }
    fetchCountries()
  }, [])

  return (
    <View style={styles.container}>
      <PressableScale
        style={[
          styles.selector,
          {
            borderColor: borderColor,
            backgroundColor: backgroundColor,
          },
        ]}
        onPress={toggleDropdown}
      >
        <Text
          style={{
            color: textColor,
          }}
        >
          {activeFilter.country || "Any"}
        </Text>
        <ChevronDown size={18} color={textColor} />
      </PressableScale>

      <Animated.View
        style={[
          styles.dropdown,
          animatedStyle,
          { backgroundColor: backgroundColor },
        ]}
      >
        <View
          style={{
            flex: 1,
            borderRadius: 12,
            backgroundColor: backgroundColor,
          }}
        >
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <PressableScale
                onPress={() => handleSelect(item)}
                style={[styles.option, { backgroundColor: backgroundColor }]}
              >
                <Text style={{ color: textColor }}>{item}</Text>
              </PressableScale>
            )}
          />
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
    borderRadius: 12,
  },
  dropdown: {
    overflow: "hidden",
    borderRadius: 12,
    marginTop: 4,
  },
  option: {
    paddingHorizontal: 12,
    height: 40,
    justifyContent: "center",
  },
})
