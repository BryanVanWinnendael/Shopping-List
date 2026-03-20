import { useState } from "react"
import {
  Text,
  View,
  Pressable,
  Image,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import type { ItemType } from "@/types"
import { useSettings } from "@/stores/useSettings"
import { getBackgroundColor, getBorderColor, getTextColor } from "@/lib/theme"
import CategoryIcon from "../categoryIcon"
import { scheduleOnRN } from "react-native-worklets"

function capitalize(str: string) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

type Props = {
  item: ItemType
}

export default function ItemEdit({ item }: Props) {
  const { fontSize, theme, userColors } = useSettings()
  const fade = useSharedValue(0)
  const scale = useSharedValue(0.95)

  const [modalVisible, setModalVisible] = useState(false)

  const backgroundColor = getBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

  const getTextSize = fontSize / 2
  const getLabelSize = fontSize / 3

  const getLabelColor = (): string => {
    const defaultColor = theme === "light" ? "#9ca3af" : "#50555C"
    if (!userColors.enabled) return defaultColor
    const userKey = capitalize(item.addedBy) as keyof typeof userColors
    const userColor = userColors.colors[userKey]
    return typeof userColor === "string" ? userColor : defaultColor
  }

  const animatedModalStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: scale.value }],
  }))

  const openModal = () => {
    setModalVisible(true)
    fade.value = withTiming(1, { duration: 200 })
    scale.value = withTiming(1, { duration: 200 })
  }

  const closeModal = () => {
    fade.value = withTiming(0, { duration: 150 })
    scale.value = withTiming(0.95, { duration: 150 }, (finished) => {
      if (finished) scheduleOnRN(setModalVisible, false)
    })
  }

  return (
    <GestureHandlerRootView>
      <View style={[styles.container, { backgroundColor }]}>
        {item.url && (
          <Pressable onPress={openModal} style={styles.imageWrapper}>
            <Image source={{ uri: item.url }} style={styles.image} />
          </Pressable>
        )}

        {!item.url && (
          <View style={styles.iconContainer}>
            <CategoryIcon category={item.category} theme={theme} />
          </View>
        )}

        <View style={[styles.textContainer, { borderColor: borderColor }]}>
          <Text
            style={{
              fontSize: getTextSize,
              flexWrap: "wrap",
              color: textColor,
              fontWeight: "500",
            }}
          >
            {item.item}
          </Text>
          <Text
            style={{
              fontSize: getLabelSize,
              color: getLabelColor(),
              marginTop: 8,
              textAlign: "right",
              fontWeight: "500",
            }}
          >
            added by {item.addedBy}
          </Text>
        </View>
      </View>

      {item.url && (
        <Modal transparent visible={modalVisible}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <Animated.View style={[styles.modalBackground, animatedModalStyle]}>
              <Image
                source={{ uri: item.url }}
                style={[
                  styles.modalImage,
                  { transform: [{ scale: scale.value }] },
                ]}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
    alignItems: "center",
    borderRadius: 12,
  },
  iconContainer: { width: 48, alignItems: "center", justifyContent: "center" },
  textContainer: { flex: 1, borderBottomWidth: 1 },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: 20,
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  imageWrapper: { justifyContent: "flex-end", alignItems: "flex-end" },
  image: { width: 90, height: 100, borderRadius: 8 },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: { width: "100%", height: "100%", resizeMode: "contain" },
})
