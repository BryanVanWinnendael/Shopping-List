import { View, Text, StyleSheet } from "react-native"
import { ItemType, ProductSearch } from "@/types"
import { useSettings } from "@/stores/useSettings"
import { getBackgroundColor, getBorderColor, getTextColor } from "@/lib/theme"
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

export default function AddImageButton({ item }: Props) {
  const { theme, user } = useSettings()

  const backgroundColor = getBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

  const imageOpacity = useSharedValue(0)
  const [added, setAdded] = useState(false)

  const handleAddImage = async () => {
    if (!user || added) return

    const newItem: ItemType = {
      id: uuid.v4(),
      item: item.item,
      type: "image",
      addedBy: user,
      addedAt: Date.now(),
      category: "remaining",
      url: item.image,
    }

    try {
      await addItem(newItem)

      setAdded(true)
      imageOpacity.value = 1

      setTimeout(() => {
        imageOpacity.value = withTiming(0, {
          duration: 300,
          easing: Easing.in(Easing.ease),
        })
        scheduleOnRN(setAdded, false)
      }, 3000)
    } catch (err) {
      console.error("Failed to add item:", err)
    }
  }

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }))

  return (
    <View style={styles.container}>
      <PressableScale
        style={[
          styles.button,
          {
            borderColor,
            backgroundColor: added ? "rgba(52,199,89,0.15)" : backgroundColor,
          },
        ]}
        onPress={handleAddImage}
      >
        <Animated.View style={imageAnimatedStyle}>
          <Check size={16} color="#34C759" style={{ marginRight: 4 }} />
        </Animated.View>

        <Text style={{ color: added ? "#34C759" : textColor }}>
          {added ? "Added" : "Add image"}
        </Text>
      </PressableScale>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
})
