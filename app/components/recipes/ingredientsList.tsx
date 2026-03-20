import { useState } from "react"
import { View, Text, Image, StyleSheet } from "react-native"
import { useSettings } from "@/stores/useSettings"
import { Check } from "lucide-react-native"
import {
  getBackgroundColor,
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import uuid from "react-native-uuid"
import { addItem } from "@/lib/firebase"
import { ItemType, Recipe } from "@/types"
import { useInteractions } from "@/stores/useInteractions"
import { PressableScale } from "pressto"

type Props = {
  recipe: Recipe
}

export function IngredientsList({ recipe }: Props) {
  const { theme, user } = useSettings()
  const { handleNotification } = useInteractions()
  const [selected, setSelected] = useState<number[]>([])

  const backgroundColor = getBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const textColor = getTextColor(theme)
  const borderColor = getBorderColor(theme)

  const allAdded = recipe?.list?.length
    ? selected.length === recipe.list.length
    : false

  const addSelectedItem = async (index: number) => {
    if (!selected.includes(index)) {
      setSelected((prev) => [...prev, index])
      if (!recipe?.list) return

      const item = recipe?.list[index].item
      const url = recipe?.list[index].url

      if (url) await handleAddImage(item, url)
      else await handleAddText(item)

      handleNotification("added", user)
    }
  }

  const addAll = () => {
    if (!recipe?.list) return

    recipe?.list.forEach((_, index) => {
      addSelectedItem(index)
    })
  }

  const handleAddText = async (item: string) => {
    if (!user) return

    let trimmedItem = item.trim()
    if (trimmedItem.endsWith(".")) {
      trimmedItem = trimmedItem.slice(0, -1)
    }

    const time = new Date().getTime()
    const id = uuid.v4()
    const newItem: ItemType = {
      id: id,
      item: trimmedItem,
      type: "text",
      addedBy: user,
      addedAt: time,
      category: "remaining",
    }

    await addItem(newItem)
  }

  const handleAddImage = async (item: string, url: string) => {
    if (!user) return

    let trimmedItem = item.trim()
    if (trimmedItem.endsWith(".")) {
      trimmedItem = trimmedItem.slice(0, -1)
    }

    const time = new Date().getTime()
    const id = uuid.v4()
    const newItem: ItemType = {
      id: id,
      item: trimmedItem,
      type: "image",
      addedBy: user,
      addedAt: time,
      url: url,
      category: "remaining",
    }

    await addItem(newItem)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            styles.headerText,
            { color: theme === "light" ? "#111" : "#fff" },
          ]}
        >
          Ingredients
        </Text>

        <PressableScale
          onPress={addAll}
          style={{
            backgroundColor: allAdded
              ? "rgba(52,199,89,0.15)"
              : secondaryBackgroundColor,
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            borderColor: borderColor,
            borderWidth: allAdded ? 0 : 1,
          }}
        >
          {allAdded && (
            <Check size={16} color="#34C759" style={{ marginRight: 4 }} />
          )}
          <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: allAdded ? "#34C759" : textColor,
              textDecorationLine: allAdded ? "underline" : "none",
            }}
          >
            {allAdded ? "Added All" : "Add All"}
          </Text>
        </PressableScale>
      </View>

      {recipe?.list?.map((item, index) => {
        const isSelected = selected.includes(index)

        return (
          <View
            key={index}
            style={[
              styles.itemRow,
              {
                backgroundColor: secondaryBackgroundColor,
                borderColor: borderColor,
              },
            ]}
          >
            <View style={styles.itemContent}>
              {item.type === "image" && item.url && (
                <Image
                  source={{ uri: item.url }}
                  style={{ width: 40, height: 40, borderRadius: 6 }}
                />
              )}
              <Text
                style={[styles.itemText, { color: textColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.item}
              </Text>
            </View>

            <PressableScale
              onPress={() => addSelectedItem(index)}
              style={{
                backgroundColor: isSelected
                  ? "rgba(52,199,89,0.15)"
                  : backgroundColor,
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 8,
                borderColor: borderColor,
                borderWidth: isSelected ? 0 : 1,
              }}
            >
              {isSelected && (
                <Check size={16} color="#34C759" style={{ marginRight: 4 }} />
              )}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: isSelected ? "#34C759" : textColor,
                  textDecorationLine: isSelected ? "underline" : "none",
                }}
              >
                {isSelected ? "Added" : "Add"}
              </Text>
            </PressableScale>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 8,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    flex: 1,
  },
})
