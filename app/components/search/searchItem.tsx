import { View, Text, StyleSheet, Image } from "react-native"
import type { ItemType, ProductSearch } from "@/types"
import { useSettings } from "@/stores/useSettings"
import {
  getBackgroundColor,
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import CategoryIcon from "../categoryIcon"
import { PressableScale } from "pressto"
import uuid from "react-native-uuid"
import { addItem } from "@/lib/firebase"
import { useState } from "react"
import { Check } from "lucide-react-native"
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"

type Props = {
  item: ProductSearch
}

export default function SearchItem({ item }: Props) {
  const { fontSize, theme, userColors, user } = useSettings()

  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const backgroundColor = getBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

  const imageOpacity = useSharedValue(0)
  const textOpacity = useSharedValue(0)

  const [addedTypes, setAddedTypes] = useState<ItemType["type"][]>([])

  const getTextSize = fontSize / 2
  const getLabelSize = fontSize / 3

  const getLabelColor = (): string => {
    const defaultColor = theme === "light" ? "#9ca3af" : "#50555C"
    if (!userColors.enabled || !user) return defaultColor
    const userColor = userColors.colors[user]
    return typeof userColor === "string" ? userColor : defaultColor
  }

  const handleAddToList = async (type: ItemType["type"]) => {
    if (!user || addedTypes.includes(type)) return

    let trimmed = ""
    if (type === "text") {
      trimmed = `${item.brand}: ${item.item.trim()}`
      if (trimmed.endsWith(".")) trimmed = trimmed.slice(0, -1)
    }

    const newItem: ItemType = {
      id: uuid.v4(),
      item: trimmed || item.item,
      type: type,
      addedBy: user,
      addedAt: Date.now(),
      category: type === "text" ? item.category : "remaining",
      ...(type === "image" ? { url: item.image } : {}),
    }

    try {
      await addItem(newItem)

      setAddedTypes((prev) => [...prev, type])

      const anim = type === "image" ? imageOpacity : textOpacity
      anim.value = 1

      setTimeout(() => {
        anim.value = withTiming(0, {
          duration: 300,
          easing: Easing.in(Easing.ease),
        })
        scheduleOnRN(setAddedTypes, (prev) => prev.filter((t) => t !== type))
      }, 3000)
    } catch (err) {
      console.error("Failed to add item:", err)
    }
  }

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }))
  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }))

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: secondaryBackgroundColor, borderColor },
      ]}
    >
      <View style={styles.innerCard}>
        <Image
          source={{ uri: item.image }}
          style={[styles.image, { backgroundColor: secondaryBackgroundColor }]}
          resizeMode="cover"
        />

        <View style={styles.info}>
          <Text
            style={[
              styles.productName,
              { color: textColor, fontSize: getTextSize },
            ]}
          >
            {item.item}
          </Text>

          <Text
            style={[
              styles.brandName,
              { color: getLabelColor(), fontSize: getLabelSize },
            ]}
          >
            {item.brand}
          </Text>

          <View style={styles.categoryContainer}>
            <CategoryIcon
              theme={theme}
              category={item.category}
              size={25}
              svgSizeSmaller={12}
            />
            <Text
              style={[
                styles.categoryText,
                { color: getLabelColor(), fontSize: getLabelSize },
              ]}
            >
              {item.category}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <PressableScale
          style={[
            styles.button,
            {
              borderColor,
              backgroundColor: addedTypes.includes("image")
                ? "rgba(52,199,89,0.15)"
                : backgroundColor,
            },
          ]}
          onPress={() => handleAddToList("image")}
        >
          <Animated.View style={imageAnimatedStyle}>
            <Check size={16} color="#34C759" style={{ marginRight: 4 }} />
          </Animated.View>
          <Text
            style={{
              color: addedTypes.includes("image") ? "#34C759" : textColor,
            }}
          >
            {addedTypes.includes("image") ? "Added" : "Add image"}
          </Text>
        </PressableScale>

        <PressableScale
          style={[
            styles.button,
            {
              borderColor,
              backgroundColor: addedTypes.includes("text")
                ? "rgba(52,199,89,0.15)"
                : backgroundColor,
            },
          ]}
          onPress={() => handleAddToList("text")}
        >
          <Animated.View style={textAnimatedStyle}>
            <Check size={16} color="#34C759" style={{ marginRight: 4 }} />
          </Animated.View>
          <Text
            style={{
              color: addedTypes.includes("text") ? "#34C759" : textColor,
            }}
          >
            {addedTypes.includes("text") ? "Added" : "Add text"}
          </Text>
        </PressableScale>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    overflow: "hidden",
    position: "relative",
    marginHorizontal: 10,
  },
  innerCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttons: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    position: "relative",
    paddingBottom: 20,
  },
  productName: {
    fontWeight: "700",
    marginBottom: 4,
  },
  brandName: {
    fontWeight: "400",
    marginBottom: 8,
  },
  categoryContainer: {
    position: "absolute",
    bottom: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    marginLeft: 4,
    fontWeight: "500",
  },
})
