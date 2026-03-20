import { useEffect, useState } from "react"
import {
  View,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native"
import { PressableScale } from "pressto"
import Svg, { Path } from "react-native-svg"
import * as ImagePicker from "expo-image-picker"
import uuid from "react-native-uuid"
import { ImageInput } from "./imageInput"
import { GlassOrBlurView } from "../glassOrBlurView"
import { addItem } from "@/lib/firebase"
import { uploadListImage } from "@/lib/storage"
import { ItemType } from "@/types"
import { useSettings } from "@/stores/useSettings"
import { useInteractions } from "@/stores/useInteractions"
import {
  getBlurSecondaryBackgroundColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { useSharedValue, withTiming } from "react-native-reanimated"
import { X } from "lucide-react-native"

export function ItemInput() {
  const { user, theme, aColorUse, aColor } = useSettings()
  const { handleNotification, setError } = useInteractions()
  const previewHeight = useSharedValue(0)

  const [item, setItem] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] =
    useState<ImagePicker.ImagePickerAsset | null>(null)
  const [loading, setLoading] = useState(false)

  const textColor = getTextColor(theme)
  const blurSecondaryBackgroundColor = getBlurSecondaryBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)

  const removeFile = () => {
    setPreviewUrl(null)
    setImageFile(null)
  }

  const onPickFile = (uri: string, image: ImagePicker.ImagePickerAsset) => {
    setPreviewUrl(uri)
    setImageFile(image)
  }

  const handleAddText = async () => {
    if (!item || !user) return

    let trimmed = item.trim()
    if (trimmed.endsWith(".")) trimmed = trimmed.slice(0, -1)

    const newItem: ItemType = {
      id: uuid.v4(),
      item: trimmed,
      type: "text",
      addedBy: user,
      addedAt: Date.now(),
      category: "remaining",
    }

    await addItem(newItem)
    setItem("")
    return true
  }

  const handleAddImage = async () => {
    if (!imageFile || !user) return
    const id = uuid.v4()
    const result = await uploadListImage(imageFile, id)

    if (!result.ok) {
      setError(result.reason)
      return false
    }

    const url = result.url
    const newItem: ItemType = {
      id,
      item: item,
      type: "image",
      addedBy: user,
      addedAt: Date.now(),
      url: url,
      category: "remaining",
    }

    await addItem(newItem)
    setItem("")
    setPreviewUrl(null)
    return true
  }

  const handleAdd = async () => {
    setLoading(true)
    const res = previewUrl ? await handleAddImage() : await handleAddText()
    if (res) {
      handleNotification("added", user)
    }
    setLoading(false)
  }

  useEffect(() => {
    previewHeight.value = withTiming(previewUrl ? 80 : 0, { duration: 200 })
  }, [previewUrl])

  return (
    <View style={[styles.blurContainer]}>
      <GlassOrBlurView
        style={styles.glassView}
        glassBackgroundColor={secondaryBackgroundColor}
        givenGlassBorderColor={secondaryBackgroundColor}
        blurBackground={blurSecondaryBackgroundColor}
        givenBlurBorderColor={blurSecondaryBackgroundColor}
      >
        {previewUrl && (
          <View style={styles.previewWrapper}>
            <Image
              source={{ uri: previewUrl }}
              resizeMode="cover"
              style={styles.previewImage}
            />

            <GlassOrBlurView style={styles.closeButtonGlass}>
              <PressableScale onPress={removeFile}>
                <X size={16} color={textColor} />
              </PressableScale>
            </GlassOrBlurView>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            keyboardAppearance={theme === "light" ? "light" : "dark"}
            placeholder="Type here..."
            placeholderTextColor="#aaa"
            value={item}
            onChangeText={setItem}
            style={[styles.textInput, { color: textColor }]}
          />
        </View>

        <View style={styles.pillRow}>
          <GlassOrBlurView style={[styles.imageInputWrapper]}>
            <ImageInput type="list" onPick={onPickFile} />
          </GlassOrBlurView>

          <View style={styles.sendWrapper}>
            {(item || previewUrl) && (
              <PressableScale onPress={handleAdd}>
                <GlassOrBlurView style={[styles.sendButton]}>
                  {loading ? (
                    <ActivityIndicator size="small" color={textColor} />
                  ) : (
                    <Svg
                      width="20px"
                      height="20px"
                      viewBox="0 -0.5 25 25"
                      fill="none"
                    >
                      <Path
                        d="M18.455 9.8834L7.063 4.1434C6.76535 3.96928 6.40109 3.95274 6.08888 4.09916C5.77667 4.24558 5.55647 4.53621 5.5 4.8764C5.5039 4.98942 5.53114 5.10041 5.58 5.2024L7.749 10.4424C7.85786 10.7903 7.91711 11.1519 7.925 11.5164C7.91714 11.8809 7.85789 12.2425 7.749 12.5904L5.58 17.8304C5.53114 17.9324 5.5039 18.0434 5.5 18.1564C5.55687 18.4961 5.77703 18.7862 6.0889 18.9323C6.40078 19.0785 6.76456 19.062 7.062 18.8884L18.455 13.1484C19.0903 12.8533 19.4967 12.2164 19.4967 11.5159C19.4967 10.8154 19.0903 10.1785 18.455 9.8834V9.8834Z"
                        stroke={aColorUse.input ? aColor : "gray"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </GlassOrBlurView>
              </PressableScale>
            )}
          </View>
        </View>
      </GlassOrBlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  blurContainer: {
    paddingBottom: 40,
    paddingHorizontal: 10,
  },
  glassView: {
    borderRadius: 20,
    paddingBottom: 16,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  previewWrapper: {
    marginBottom: 12,
    position: "relative",
    width: 80,
    height: 80,
  },
  previewImage: { width: "100%", height: "100%", borderRadius: 6 },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 50,
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  closeButtonGlass: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 50,
    padding: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  textInput: { flex: 1, height: 32 },
  pillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  imageInputWrapper: {
    borderRadius: 50,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  sendWrapper: { height: 40, justifyContent: "center" },
  sendButton: {
    borderRadius: 50,
    height: 40,
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
})
