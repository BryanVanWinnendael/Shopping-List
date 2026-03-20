import { useEffect, useState } from "react"
import {
  Modal,
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native"
import Svg, { Path } from "react-native-svg"
import { PressableScale } from "pressto"
import { editItem as editFirebaseItem } from "@/lib/firebase"
import { useSettings } from "@/stores/useSettings"
import { GlassOrBlurView } from "../glassOrBlurView"
import ItemEdit from "../list/itemEdit"
import { ItemType } from "@/types"
import {
  getTextColor,
  getSecondaryBackgroundColor,
  getBlurBackgroundColor,
  getBlurSecondaryBackgroundColor,
} from "@/lib/theme"

export function EditInput() {
  const { user, theme, editItem, setEditItem } = useSettings()

  const [newEditItem, setNewEditItem] = useState(editItem)
  const [item, setItem] = useState("")

  const textColor = getTextColor(theme)
  const backgroundColor = getBlurBackgroundColor(theme)
  const blurSecondaryBackgroundColor = getBlurSecondaryBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)

  const handleEdit = async () => {
    if (!item || item === "" || !user || !editItem) return
    let trimmedItem = item.trim()

    if (trimmedItem.endsWith(".")) {
      trimmedItem = trimmedItem.slice(0, -1)
    }

    if (trimmedItem === editItem.item) return

    const updatedItem: ItemType = {
      ...editItem,
      item: trimmedItem,
    }

    await editFirebaseItem(updatedItem)
    setItem("")
    setEditItem(null)
  }

  const handleEditText = (newText: string) => {
    if (!newEditItem) return
    setItem(newText)
    const item: ItemType = {
      ...newEditItem,
      item: newText,
    }
    setNewEditItem(item)
  }

  const handleClose = () => {
    setItem("")
    setEditItem(null)
  }

  useEffect(() => {
    if (editItem) {
      setItem(editItem.item)
      setNewEditItem(editItem)
    }
  }, [editItem])

  return (
    <Modal transparent animationType="fade">
      <TouchableWithoutFeedback onPress={handleClose}>
        <GlassOrBlurView
          forceBlur
          blur={10}
          style={styles.modalOverlay}
          blurBackground={backgroundColor}
          givenBlurBorderColor={backgroundColor}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, width: "100%" }}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "flex-start",
                alignItems: "center",
                paddingTop: 60,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
                <GlassOrBlurView style={styles.closeButtonModal}>
                  <PressableScale
                    onPress={handleClose}
                    style={styles.closeButton}
                  >
                    <Svg
                      width="20"
                      height="20"
                      viewBox="-0.5 0 25 25"
                      fill="none"
                    >
                      <Path
                        d="M3 21.32L21 3.32001"
                        stroke={textColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M3 3.32001L21 21.32"
                        stroke={textColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </PressableScale>
                </GlassOrBlurView>
                {newEditItem && <ItemEdit item={newEditItem} />}
                <GlassOrBlurView
                  style={styles.glassView}
                  glassBackgroundColor={secondaryBackgroundColor}
                  givenGlassBorderColor={secondaryBackgroundColor}
                  blurBackground={blurSecondaryBackgroundColor}
                  givenBlurBorderColor={blurSecondaryBackgroundColor}
                >
                  <TextInput
                    autoFocus
                    value={item}
                    onChangeText={handleEditText}
                    placeholder="Edit item..."
                    placeholderTextColor="#aaa"
                    style={[styles.modalInput, { color: textColor }]}
                    keyboardAppearance={theme === "light" ? "light" : "dark"}
                  />
                  <GlassOrBlurView
                    style={[styles.sendButton, styles.sendButtonModal]}
                  >
                    <PressableScale
                      style={[styles.sendButton]}
                      onPress={handleEdit}
                    >
                      <Svg
                        width="24"
                        height="24"
                        viewBox="0 0 25 25"
                        fill="none"
                      >
                        <Path
                          d="M18.455 9.8834L7.063 4.1434C6.76535 3.96928 6.40109 3.95274 6.08888 4.09916C5.77667 4.24558 5.55647 4.53621 5.5 4.8764C5.5039 4.98942 5.53114 5.10041 5.58 5.2024L7.749 10.4424C7.85786 10.7903 7.91711 11.1519 7.925 11.5164C7.91714 11.8809 7.85789 12.2425 7.749 12.5904L5.58 17.8304C5.53114 17.9324 5.5039 18.0434 5.5 18.1564C5.55687 18.4961 5.77703 18.7862 6.0889 18.9323C6.40078 19.0785 6.76456 19.062 7.062 18.8884L18.455 13.1484C19.0903 12.8533 19.4967 12.2164 19.4967 11.5159C19.4967 10.8154 19.0903 10.1785 18.455 9.8834V9.8834Z"
                          stroke="gray"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </PressableScale>
                  </GlassOrBlurView>
                </GlassOrBlurView>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </GlassOrBlurView>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  glassView: {
    borderRadius: 20,
    paddingBottom: 16,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  sendButton: {
    borderRadius: 50,
    height: 40,
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: 20,
  },
  modalInput: {
    padding: 8,
    fontSize: 18,
  },
  sendButtonModal: { marginTop: 23, alignSelf: "flex-end" },
  closeButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  closeButtonModal: {
    alignSelf: "flex-start",
    borderRadius: 50,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
})
