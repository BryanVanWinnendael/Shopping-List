import { useState } from "react"
import { View, Text, Modal, StyleSheet } from "react-native"
import Slider from "@react-native-community/slider"
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import CategoryIcon from "@/components/categoryIcon"
import { useSettings } from "@/stores/useSettings"
import {
  getBackgroundColor,
  getBlurBackgroundColor,
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import Animated from "react-native-reanimated"
import { GlassOrBlurView } from "../glassOrBlurView"
import { PressableScale } from "pressto"

const DEFAULT_FONT_SIZE = 35
const MIN_FONT_SIZE = 30
const MAX_FONT_SIZE = 80

export default function FontSize() {
  const { fontSize, setFontSize, theme, aColor } = useSettings()
  const scale = useSharedValue(1)

  const [modalVisible, setModalVisible] = useState(false)
  const [tempFontSize, setTempFontSize] = useState(fontSize)

  const backgroundColor = getBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const blurBackgroundColor = getBlurBackgroundColor(theme)
  const textColor = getTextColor(theme)
  const borderColor = getBorderColor(theme)

  const getTextSize = tempFontSize / 2
  const getLabelSize = tempFontSize / 3

  const resetFontSize = () => {
    scale.value = withSpring(1)
    setTempFontSize(DEFAULT_FONT_SIZE)
    setFontSize(DEFAULT_FONT_SIZE)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
  }

  const applyFontSize = () => {
    setFontSize(tempFontSize)
    setModalVisible(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
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
      <View style={[styles.row]}>
        <Text style={[styles.title, { color: textColor }]}>Font Size</Text>
        <PressableScale
          style={[styles.editButton, { borderColor: borderColor }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: textColor, fontSize: 15 }}>Edit</Text>
        </PressableScale>
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
          <PressableScale
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            pointerEvents="box-none"
          >
            <Animated.View
              style={[
                styles.modalContent,
                { backgroundColor, borderColor: borderColor },
                animatedStyle,
              ]}
            >
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Choose Font Size
              </Text>

              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={MIN_FONT_SIZE}
                  maximumValue={MAX_FONT_SIZE}
                  step={1}
                  value={tempFontSize}
                  onValueChange={(val) => setTempFontSize(Math.round(val))}
                  minimumTrackTintColor={aColor}
                  onSlidingStart={() => {
                    scale.value = withSpring(1.05)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  }}
                  onSlidingComplete={() => {
                    scale.value = withSpring(1)
                  }}
                />
              </View>

              <View style={[styles.previewContainer, { backgroundColor }]}>
                <View style={styles.previewRow}>
                  <View style={styles.previewIcon}>
                    <CategoryIcon category="remaining" theme={theme} />
                  </View>
                  <View
                    style={[
                      styles.previewTextWrapper,
                      { borderColor: borderColor },
                    ]}
                  >
                    <Text
                      style={{ fontSize: getTextSize, color: textColor }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      Font size preview
                    </Text>
                    <Text
                      style={{
                        fontSize: getLabelSize,
                        color: theme === "light" ? "#9ca3af" : "#50555C",
                        marginTop: 8,
                        textAlign: "right",
                      }}
                    >
                      added by
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actions}>
                <PressableScale
                  style={[styles.button, { borderWidth: 1, borderColor }]}
                  onPress={resetFontSize}
                >
                  <Text style={[styles.resetText, { color: textColor }]}>
                    Reset to Default
                  </Text>
                </PressableScale>
                <PressableScale
                  style={[styles.button, { backgroundColor: aColor }]}
                  onPress={applyFontSize}
                >
                  <Text
                    style={[
                      styles.doneText,
                      { color: theme === "light" ? "white" : "black" },
                    ]}
                  >
                    Done
                  </Text>
                </PressableScale>
              </View>
            </Animated.View>
          </View>
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
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  title: { fontWeight: "600", fontSize: 16 },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    marginVertical: 16,
  },
  slider: { flex: 1, height: "100%" },
  resetButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#ccc",
    height: "100%",
  },
  resetText: { fontSize: 14 },
  previewContainer: {
    height: 100,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  previewRow: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "flex-start",
    gap: 8,
  },
  previewIcon: {
    width: 48,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  previewTextWrapper: {
    flex: 1,
    borderBottomWidth: 1,
    justifyContent: "center",
  },
  actions: {
    marginTop: 24,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: { borderRadius: 6, paddingVertical: 8, paddingHorizontal: 16 },
  doneText: { fontSize: 14, fontWeight: "600" },
})
