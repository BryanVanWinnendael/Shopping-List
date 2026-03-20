import { useState } from "react"
import { View, Text, Modal, Switch, StyleSheet } from "react-native"
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
import {
  DEFAULT_ACOLOR,
  getBackgroundColor,
  getBlurBackgroundColor,
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { PressableScale } from "pressto"
import { GlassOrBlurView } from "../glassOrBlurView"

export default function AColor() {
  const { aColor, setAColor, theme, setAColorUse, aColorUse } = useSettings()
  const currentColor = useSharedValue(aColor)
  const scale = useSharedValue(1)

  const [modalVisible, setModalVisible] = useState(false)
  const [pickedColor, setPickedColor] = useState(aColor)

  const backgroundColor = getBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const textColor = getTextColor(theme)
  const borderColor = getBorderColor(theme)
  const blurBackgroundColor = getBlurBackgroundColor(theme)

  const onColorChange = (color: ColorFormatsObject) => {
    "worklet"
    currentColor.value = color.hex
    scale.value = withSpring(1.05)
  }

  const onColorPick = (color: ColorFormatsObject) => {
    setPickedColor(color.hex)
    setAColor(color.hex)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const resetToDefault = () => {
    setPickedColor(DEFAULT_ACOLOR)
    setAColor(DEFAULT_ACOLOR)
    setModalVisible(false)
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: secondaryBackgroundColor,
          borderColor: borderColor,
          borderWidth: 0.2,
        },
      ]}
    >
      <View
        style={[
          styles.row,
          {
            borderColor: borderColor,
            borderBottomWidth: 1,
          },
        ]}
      >
        <Text style={[styles.title, { color: textColor }]}>Accent Color</Text>

        <PressableScale
          style={[styles.editButton, { borderColor: borderColor }]}
          onPress={() => setModalVisible(true)}
        >
          <View style={[styles.colorDot, { backgroundColor: aColor }]} />
          <Text style={{ color: textColor, fontSize: 15 }}>Edit</Text>
        </PressableScale>
      </View>

      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={[styles.subtitle, { color: textColor }]}>
            Use Accent Color for Image Picker
          </Text>
          <Text
            style={[
              styles.helperText,
              { color: theme === "light" ? "#9ca3af" : "#50555C" },
            ]}
          >
            Applies accent color to the button used to select images for upload.
          </Text>
        </View>
        <Switch
          value={aColorUse.image}
          onValueChange={(val) => setAColorUse({ ...aColorUse, image: val })}
          trackColor={{ false: "#767577", true: aColor }}
          ios_backgroundColor="#767577"
          thumbColor={aColorUse.image ? "#fff" : "#f4f3f4"}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={[styles.subtitle, { color: textColor }]}>
            Use Accent Color for Send Button
          </Text>
          <Text
            style={[
              styles.helperText,
              { color: theme === "light" ? "#9ca3af" : "#50555C" },
            ]}
          >
            Applies accent color to the send button when typing.
          </Text>
        </View>
        <Switch
          value={aColorUse.input}
          onValueChange={(val) => setAColorUse({ ...aColorUse, input: val })}
          trackColor={{ false: "#767577", true: aColor }}
          ios_backgroundColor="#767577"
          thumbColor={aColorUse.input ? "#fff" : "#f4f3f4"}
        />
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <GlassOrBlurView
          style={[
            styles.modalOverlay,
            { backgroundColor: blurBackgroundColor },
          ]}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor,
                borderColor: borderColor,
              },
              animatedStyle,
            ]}
          >
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Choose a Color
            </Text>

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
                <Panel1
                  style={{
                    borderRadius: 16,
                    width: "70%",
                    height: "70%",
                    alignSelf: "center",
                  }}
                />
              </HueCircular>

              <View style={[styles.divider, { backgroundColor }]} />
            </ColorPicker>

            <View style={styles.actions}>
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
                  style={[
                    styles.resetText,
                    { color: theme === "light" ? "#5C5C5C" : "#88888C" },
                  ]}
                >
                  Reset to Default
                </Text>
              </PressableScale>

              <PressableScale
                style={[styles.doneButton, { backgroundColor: aColor }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.doneText}>Done</Text>
              </PressableScale>
            </View>
          </Animated.View>
        </GlassOrBlurView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  colorDot: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 10,
  },
  textBlock: {
    flex: 1,
    paddingRight: 10,
  },
  subtitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  resetButton: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetText: {
    fontSize: 14,
  },
  doneButton: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  doneText: {
    fontSize: 14,
    color: "#fff",
  },
})
