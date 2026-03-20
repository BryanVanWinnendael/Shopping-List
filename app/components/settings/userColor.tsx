import { useState } from "react"
import { View, Text, Modal, StyleSheet } from "react-native"
import ColorPicker, {
  HueCircular,
  Panel1,
  type ColorFormatsObject,
} from "reanimated-color-picker"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { useSettings } from "@/stores/useSettings"
import { getBackgroundColor, getBorderColor, getTextColor } from "@/lib/theme"
import { Users } from "@/types"
import { PressableScale } from "pressto"
import { GlassOrBlurView } from "../glassOrBlurView"

type Props = {
  user: Users
}

export default function UserColor({ user }: Props) {
  const { aColor, theme, setUserColors, userColors } = useSettings()
  const currentColor = useSharedValue(aColor)
  const scale = useSharedValue(1)

  const [modalVisible, setModalVisible] = useState(false)
  const resetColor = theme === "light" ? "#9ca3af" : "#50555C"
  const [pickedColor, setPickedColor] = useState(
    userColors.colors[user] ? userColors.colors[user] : resetColor,
  )

  const backgroundColor = getBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const onColorChange = (color: ColorFormatsObject) => {
    "worklet"
    currentColor.value = color.hex
    scale.value = withSpring(1.05)
  }

  const onColorPick = (color: ColorFormatsObject) => {
    setUserColors({
      ...userColors,
      colors: {
        ...userColors.colors,
        [user]: color.hex,
      },
    })
    setPickedColor(color.hex)
    scale.value = withSpring(1)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const resetToDefault = () => {
    setUserColors({
      ...userColors,
      [user]: false,
    })
    setPickedColor(resetColor)
    setModalVisible(false)
  }

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: textColor }]}>{user}</Text>

      <PressableScale
        style={[styles.button, { borderColor: borderColor }]}
        onPress={() => setModalVisible(true)}
      >
        <View
          style={[
            styles.colorPreview,
            {
              backgroundColor: userColors.colors[user]
                ? userColors.colors[user]
                : resetColor,
            },
          ]}
        />
        <Text style={[styles.buttonText, { color: textColor }]}>Edit</Text>
      </PressableScale>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <GlassOrBlurView style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              { backgroundColor, borderColor: borderColor },
              animatedStyle,
            ]}
          >
            <View style={styles.modalTitleRow}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Choose a Color for&nbsp;
              </Text>
              <Text style={[styles.modalTitle, { color: pickedColor }]}>
                {user}
              </Text>
            </View>

            <ColorPicker
              value={pickedColor}
              sliderThickness={20}
              thumbSize={24}
              onChange={onColorChange}
              onCompleteJS={onColorPick}
              onComplete={() => {
                "worklet"
                scale.value = withSpring(1)
              }}
              boundedThumb
            >
              <HueCircular
                containerStyle={{ justifyContent: "center" }}
                thumbShape="circle"
              >
                <Panel1 style={styles.panel} />
              </HueCircular>
              <View style={[styles.divider, { backgroundColor }]} />
            </ColorPicker>

            <View style={styles.modalButtonsRow}>
              <PressableScale
                style={[
                  styles.resetButton,
                  {
                    backgroundColor: theme === "light" ? "#F5F5F5" : "#1A1A1A",
                  },
                ]}
                onPress={resetToDefault}
              >
                <Text
                  style={{
                    color: theme === "light" ? "#5C5C5C" : "#88888C",
                    fontSize: 14,
                  }}
                >
                  Reset to Default
                </Text>
              </PressableScale>

              <PressableScale
                style={[styles.doneButton, { backgroundColor: aColor }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "white", fontSize: 14 }}>Done</Text>
              </PressableScale>
            </View>
          </Animated.View>
        </GlassOrBlurView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  title: { fontWeight: "600", fontSize: 16 },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: { fontSize: 14 },
  colorPreview: { width: 20, height: 20, marginRight: 8, borderRadius: 999 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modalTitleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: "600" },
  panel: { borderRadius: 16, width: "70%", height: "70%", alignSelf: "center" },
  divider: { height: 1, marginVertical: 16 },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  resetButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  doneButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
})
