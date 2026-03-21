import { useCallback, useState } from "react"
import {
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated"
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler"
import Svg, { Path } from "react-native-svg"
import * as Haptics from "expo-haptics"
import type { ItemType } from "@/types"
import { useSettings } from "@/stores/useSettings"
import {
  getBackgroundColor,
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import CategoryIcon from "../categoryIcon"
import { ImageLoader } from "../imageLoader"
import { PressableScale } from "pressto"
import { fuzzySearchProducts } from "@/lib/product-search"
import { useInteractions } from "@/stores/useInteractions"
import { scheduleOnRN } from "react-native-worklets"

const SWIPE_DISTANCE = -130
const SWIPE_THRESHOLD = -20
const OVER_SWIPE_DISTANCE = 120

function capitalize(str: string) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

type Props = {
  item: ItemType
  onDelete: (item: ItemType) => void
  scrollRef: any
  onEdit: (item: ItemType) => void
}

export default function Item({ item, onDelete, scrollRef, onEdit }: Props) {
  const { fontSize, theme, userColors } = useSettings()
  const { setSearchItems, searchSheet, setSearchItemsResult } =
    useInteractions()

  const offsetX = useSharedValue(0)
  const startX = useSharedValue(0)
  const pressed = useSharedValue(false)
  const triggeredHaptic = useSharedValue(false)
  const fade = useSharedValue(0)
  const scale = useSharedValue(0.95)
  const longPressProgress = useSharedValue(0)
  const searchingDelay = useSharedValue(0)
  const openSheetDelay = useSharedValue(0)
  const longPressTriggered = useSharedValue(false)

  const [modalVisible, setModalVisible] = useState(false)

  const backgroundColor = getBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
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

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onBegin(() => {
      startX.value = offsetX.value
    })
    .onUpdate((e) => {
      const newX = startX.value + e.translationX
      offsetX.value = Math.min(0, newX)
    })
    .onEnd(() => {
      if (offsetX.value < SWIPE_DISTANCE - OVER_SWIPE_DISTANCE) {
        offsetX.value = withTiming(-500, { duration: 200 }, (finished) => {
          if (finished) scheduleOnRN(onDelete, item)
        })
        return
      }
      const distanceToClosed = Math.abs(offsetX.value - 0)
      const distanceToOpen = Math.abs(offsetX.value - SWIPE_DISTANCE)
      if (distanceToOpen < distanceToClosed) {
        offsetX.value = withTiming(SWIPE_DISTANCE, { duration: 200 })
      } else {
        offsetX.value = withTiming(0, { duration: 200 })
      }
    })
    .simultaneousWithExternalGesture(scrollRef)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }))

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      pressed.value || offsetX.value < 0 ? 1 : 0,
      [0, 1],
      [backgroundColor, secondaryBackgroundColor],
    ),
  }))

  const deleteBackgroundStyle = useAnimatedStyle(() => {
    const isVisible = offsetX.value < SWIPE_THRESHOLD
    const passedDeletePoint =
      offsetX.value < SWIPE_DISTANCE - OVER_SWIPE_DISTANCE

    const baseWidth = isVisible ? 48 : 0
    const extraWidth = isVisible
      ? Math.max(0, -(offsetX.value - SWIPE_DISTANCE))
      : 0

    if (passedDeletePoint && !triggeredHaptic.value) {
      triggeredHaptic.value = true
      scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Medium)
    } else if (!passedDeletePoint) {
      triggeredHaptic.value = false
    }

    return {
      width: baseWidth + extraWidth,
      opacity: isVisible ? 1 : 0,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: passedDeletePoint ? "flex-start" : "center",
      paddingLeft: passedDeletePoint ? 16 : 0,
    }
  })

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

  const searchItem = async () => {
    const res = await fuzzySearchProducts(item.item, item.category, 0)
    setSearchItemsResult(res)
  }

  const openSheet = useCallback(() => {
    setSearchItems(null)
    if (!searchSheet) return
    searchSheet.current?.expand()
  }, [])

  return (
    <>
      <GestureHandlerRootView>
        <View style={styles.wrapper}>
          <View style={styles.deleteBackground}>
            <View
              style={[
                styles.editIconWrapper,
                { backgroundColor: secondaryBackgroundColor },
              ]}
            >
              <PressableScale
                onPress={() =>
                  (offsetX.value = withTiming(
                    0,
                    { duration: 150 },
                    (finished) => {
                      if (finished) scheduleOnRN(onEdit, item)
                    },
                  ))
                }
              >
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z"
                    stroke={textColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13"
                    stroke={textColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </PressableScale>
            </View>

            <Animated.View
              style={[styles.deleteBackgroundInner, deleteBackgroundStyle]}
            >
              <PressableScale
                onPress={() => onDelete(item)}
                style={styles.deleteIconWrapper}
              >
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M6 5H18M9 5V5C10.5769 3.16026 13.4231 3.16026 15 5V5M9 20H15C16.1046 20 17 19.1046 17 18V9C17 8.44772 16.5523 8 16 8H8C7.44772 8 7 8.44772 7 9V18C7 19.1046 7.89543 20 9 20Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </PressableScale>
            </Animated.View>
          </View>

          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[styles.container, animatedStyle, backgroundAnimatedStyle]}
            >
              <PressableScale
                style={{ flex: 1, flexDirection: "row", gap: 8 }}
                onPressIn={() => {
                  if (item.type === "image") return
                  pressed.value = true
                  longPressTriggered.value = false

                  searchingDelay.value = 0
                  openSheetDelay.value = 0

                  searchingDelay.value = withTiming(
                    1,
                    { duration: 1000 },
                    (finished) => {
                      if (finished) {
                        scheduleOnRN(setSearchItems, item.item)
                      }
                    },
                  )

                  openSheetDelay.value = withTiming(
                    1,
                    { duration: 3000 },
                    (finished) => {
                      if (finished) {
                        scheduleOnRN(openSheet)
                      }
                    },
                  )

                  longPressProgress.value = withTiming(
                    1,
                    { duration: 2000 },
                    (finished) => {
                      if (finished) scheduleOnRN(searchItem)
                    },
                  )
                }}
                onPressOut={() => {
                  pressed.value = false

                  searchingDelay.value = 0
                  openSheetDelay.value = 0

                  scheduleOnRN(setSearchItems, null)

                  if (!longPressTriggered.value) {
                    longPressProgress.value = withTiming(0, { duration: 150 })
                  }
                }}
              >
                {item.url && (
                  <PressableScale
                    onPress={openModal}
                    style={styles.imageWrapper}
                  >
                    <ImageLoader
                      large={item.url}
                      small={item.url.replace("large-", "small-")}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  </PressableScale>
                )}

                {!item.url && (
                  <View style={styles.iconContainer}>
                    <CategoryIcon theme={theme} category={item.category} />
                  </View>
                )}

                <View
                  style={[styles.textContainer, { borderColor: borderColor }]}
                >
                  <View
                    style={{ height: getTextSize * 1.4, overflow: "hidden" }}
                  >
                    <Text
                      style={[
                        {
                          position: "absolute",
                          fontSize: getTextSize,
                          color: theme === "light" ? "black" : "white",
                          fontWeight: "500",
                        },
                      ]}
                    >
                      {item.item}
                    </Text>
                  </View>

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
              </PressableScale>
            </Animated.View>
          </GestureDetector>
        </View>

        {item.url && (
          <Modal transparent visible={modalVisible}>
            <TouchableWithoutFeedback onPress={closeModal}>
              <Animated.View
                style={[styles.modalBackground, animatedModalStyle]}
              >
                <ImageLoader
                  large={item.url}
                  small={item.url.replace("large-", "small-")}
                  style={[
                    styles.modalImage,
                    { transform: [{ scale: scale.value }] },
                  ]}
                  resizeMode="contain"
                />
              </Animated.View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </GestureHandlerRootView>
    </>
  )
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", marginVertical: 4 },
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
    alignItems: "center",
    borderRadius: 12,
  },
  iconContainer: { width: 48, alignItems: "center", justifyContent: "center" },
  textContainer: {
    flex: 1,
    borderBottomWidth: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: 20,
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  deleteBackgroundInner: {
    backgroundColor: "#EF4444",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIconWrapper: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  editIconWrapper: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
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
