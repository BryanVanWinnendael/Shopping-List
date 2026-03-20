import { Platform, ActionSheetIOS, Text } from "react-native"
import * as ImagePicker from "expo-image-picker"
import Svg, { Path } from "react-native-svg"
import { useSettings } from "@/stores/useSettings"
import { PressableScale } from "pressto"
import { SaveFormat, useImageManipulator } from "expo-image-manipulator"
import { useEffect, useState } from "react"
import { getBackgroundColor, getBorderColor, getTextColor } from "@/lib/theme"
import { useInteractions } from "@/stores/useInteractions"

type Props = {
  onPick: (uri: string, image: ImagePicker.ImagePickerAsset) => void
  type: "list" | "recipe"
}

const FIFTEEN_MB = 15 * 1024 * 1024

export function ImageInput({ onPick, type }: Props) {
  const { aColorUse, aColor, theme } = useSettings()
  const { setError } = useInteractions()
  const [pickedUri, setPickedUri] = useState<string | null>(null)
  const manipulator = useImageManipulator(pickedUri ?? "")

  const backgroundColor = getBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

  const pickImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
    })

    if (!result.canceled) {
      const asset = result.assets[0]
      setPickedUri(asset.uri)
    }
  }

  const pickCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      alert("Camera permission denied")
      return
    }
    const result = await ImagePicker.launchCameraAsync()
    if (!result.canceled) {
      const asset = result.assets[0]
      setPickedUri(asset.uri)
    }
  }

  useEffect(() => {
    if (!manipulator || !pickedUri) return

    const processImage = async () => {
      const rendered = await manipulator.renderAsync()

      const fileSize = (rendered as any).fileSize ?? 0

      let compress = 0.6

      if (fileSize > FIFTEEN_MB) {
        setError("Image too large, compressing…")
        compress = 0.3
      }

      const saved = await rendered.saveAsync({
        compress,
        format: SaveFormat.JPEG,
      })

      onPick(saved.uri, saved)
    }

    processImage()
  }, [manipulator, pickedUri])

  const showActionSheet = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose Picture"],
          cancelButtonIndex: 0,
          userInterfaceStyle: theme === "light" ? "light" : "dark",
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              pickCamera()
              break
            case 2:
              pickImageLibrary()
              break
          }
        },
      )
    }
  }

  return type === "list" ? (
    <PressableScale onPress={showActionSheet}>
      <Svg width="20px" height="20px" viewBox="0 0 24 24" fill="none">
        <Path
          d="M13.6471 16.375L12.0958 14.9623C11.3351 14.2694 10.9547 13.923 10.5236 13.7918C10.1439 13.6762 9.73844 13.6762 9.35878 13.7918C8.92768 13.923 8.5473 14.2694 7.78652 14.9623L4.92039 17.5575M13.6471 16.375L13.963 16.0873C14.7238 15.3944 15.1042 15.048 15.5352 14.9168C15.9149 14.8012 16.3204 14.8012 16.7 14.9168C17.1311 15.048 17.5115 15.3944 18.2723 16.0873L19.4237 17.0896M13.6471 16.375L17.0469 19.4528M17 9C17 10.1046 16.1046 11 15 11C13.8954 11 13 10.1046 13 9C13 7.89543 13.8954 7 15 7C16.1046 7 17 7.89543 17 9ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
          stroke={aColorUse.image ? aColor : "gray"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </PressableScale>
  ) : (
    <PressableScale
      style={{
        backgroundColor: backgroundColor,
        padding: 10,
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 12,
        marginTop: 8,
        alignItems: "center",
      }}
      onPress={showActionSheet}
    >
      <Text
        style={{
          color: textColor,
          fontWeight: "600",
        }}
      >
        + Add Image
      </Text>
    </PressableScale>
  )
}
