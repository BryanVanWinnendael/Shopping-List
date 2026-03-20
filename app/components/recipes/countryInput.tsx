import { COUNTRIES } from "@/lib/constants"
import {
  getBackgroundColor,
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { useSettings } from "@/stores/useSettings"
import { Country } from "@/types"
import { useHeaderHeight } from "@react-navigation/elements"
import { useMemo, useState } from "react"
import { View, Text, Modal, FlatList, TextInput, Pressable } from "react-native"

type Props = {
  value?: Country
  onChange: (country: Country | undefined) => void
}

export function CountryInput({ value, onChange }: Props) {
  const { theme } = useSettings()
  const headerHeight = useHeaderHeight()

  const [visible, setVisible] = useState(false)
  const [query, setQuery] = useState("")

  const borderColor = getBorderColor(theme)
  const backgroundColor = getBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const textColor = getTextColor(theme)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q))
  }, [query])

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={{
          backgroundColor: secondaryBackgroundColor,
          borderWidth: 1,
          borderColor: borderColor,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 20 }}>{value?.flag ?? "🌍"}</Text>
        <Text style={{ fontSize: 16, color: textColor }}>
          {value?.name ?? "Select country"}
        </Text>
      </Pressable>

      <Modal visible={visible} animationType="slide">
        <View
          style={{
            flex: 1,
            padding: 16,
            paddingTop: headerHeight,
            backgroundColor,
          }}
        >
          <TextInput
            placeholder="Search country"
            value={query}
            onChangeText={setQuery}
            style={{
              color: textColor,
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: borderColor,
              marginBottom: 12,
            }}
            placeholderTextColor="#aaa"
            keyboardAppearance={theme === "light" ? "light" : "dark"}
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.name}
            ListHeaderComponent={
              <Pressable
                onPress={() => {
                  onChange(undefined)
                  setVisible(false)
                  setQuery("")
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  gap: 12,
                }}
              >
                <Text style={{ fontSize: 16, color: textColor }}>None</Text>
              </Pressable>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChange(item)
                  setVisible(false)
                  setQuery("")
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  gap: 12,
                }}
              >
                <Text style={{ fontSize: 22 }}>{item.flag}</Text>
                <Text style={{ fontSize: 16, color: textColor }}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />

          <Pressable
            onPress={() => setVisible(false)}
            style={{ padding: 16, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "600", color: textColor }}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  )
}
