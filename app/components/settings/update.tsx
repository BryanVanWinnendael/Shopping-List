import { useState } from "react"
import { View, Text, Modal, StyleSheet, ScrollView } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated"
import { useSettings } from "@/stores/useSettings"
import {
  getBackgroundColor,
  getBlurBackgroundColor,
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import updates from "@/assets/updates.json"
import { PressableScale } from "pressto"
import { GlassOrBlurView } from "../glassOrBlurView"

export default function Update() {
  const { aColor, theme } = useSettings()
  const scale = useSharedValue(1)

  const [modalVisible, setModalVisible] = useState(false)

  const backgroundColor = getBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const blurBackgroundColor = getBlurBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

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
        <Text style={[styles.title, { color: textColor }]}>Updates</Text>

        <PressableScale
          style={[styles.editButton, { borderColor: borderColor }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: textColor, fontSize: 15 }}>Read</Text>
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
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor,
                borderColor: borderColor,
                minHeight: 200,
              },
              animatedStyle,
            ]}
          >
            <ScrollView
              style={{ maxHeight: 400 }}
              contentContainerStyle={{ gap: 16 }}
              showsVerticalScrollIndicator={true}
            >
              {updates.map((update, index) => (
                <View key={index}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme === "light" ? "#6b7280" : "#a1a9b1",
                      marginBottom: 4,
                      fontWeight: "500",
                    }}
                  >
                    {update.date}
                  </Text>

                  {update.text.map((point, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        marginBottom: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          marginRight: 6,
                          lineHeight: 20,
                          color: textColor,
                        }}
                      >
                        •
                      </Text>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 16,
                          lineHeight: 20,
                          color: textColor,
                        }}
                      >
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>

            <PressableScale
              style={[
                styles.doneButton,
                { backgroundColor: aColor, marginTop: 16 },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.doneText}>Done</Text>
            </PressableScale>
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
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
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
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
})
