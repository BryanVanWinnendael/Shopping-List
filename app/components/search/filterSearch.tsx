import { useState } from "react"
import { View, Text, ScrollView, StyleSheet } from "react-native"
import { Categories } from "@/types"
import { useSettings } from "@/stores/useSettings"
import {
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { CATEGORY_ORDER } from "@/lib/constants"
import { PressableScale } from "pressto"

type Props = {
  selected: Categories[]
  onApply: (categories: Categories[]) => void
}

type FilterCategory = {
  label: string
  value: Categories
}

const FILTER_CATEGORIES: FilterCategory[] = CATEGORY_ORDER.filter(
  (c) => c !== "remaining" && c !== "fish",
).map((c) =>
  c === "meat" ? { label: "meat/fish", value: "meat" } : { label: c, value: c },
)

export function FilterSearch({ selected, onApply }: Props) {
  const { theme, aColor } = useSettings()

  const [localSelected, setLocalSelected] = useState<Categories[]>(selected)

  const textColor = getTextColor(theme)
  const borderColor = getBorderColor(theme)
  const bg = getSecondaryBackgroundColor(theme)

  const toggleCategory = (category: Categories) => {
    setLocalSelected((prev) => {
      const newSelected = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]

      onApply(newSelected)
      return newSelected
    })
  }

  const clearAll = () => {
    setLocalSelected([])
    onApply([])
  }

  return (
    <View style={{ padding: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 12,
          color: textColor,
        }}
      >
        Filter by category
      </Text>

      <ScrollView
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {FILTER_CATEGORIES.map(({ label, value }) => {
          const active = localSelected.includes(value)

          return (
            <PressableScale
              key={value}
              onPress={() => toggleCategory(value)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: active ? aColor : borderColor,
                backgroundColor: active ? aColor : bg,
              }}
            >
              <Text
                style={{
                  color: active ? bg : textColor,
                  fontSize: 14,
                }}
              >
                {label}
              </Text>
            </PressableScale>
          )
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <PressableScale
          style={[styles.button, { backgroundColor: aColor }]}
          onPress={clearAll}
        >
          <Text style={styles.text}>Clear</Text>
        </PressableScale>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
})
