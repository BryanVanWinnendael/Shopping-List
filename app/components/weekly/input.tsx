import { View, TextInput, StyleSheet, ActivityIndicator } from "react-native"
import Svg, { Path } from "react-native-svg"
import { useSettings } from "@/stores/useSettings"
import {
  getBlurSecondaryBackgroundColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { GlassOrBlurView } from "../glassOrBlurView"
import { PressableScale } from "pressto"

type Props = {
  handleAdd: () => void
  setItem: (item: string) => void
  item: string
  loading: boolean
}

export default function Input({ handleAdd, setItem, item, loading }: Props) {
  const { theme, aColorUse, aColor } = useSettings()

  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const blurSecondaryBackgroundColor = getBlurSecondaryBackgroundColor(theme)
  const textColor = getTextColor(theme)

  return (
    <View style={styles.container}>
      <GlassOrBlurView
        style={[styles.innerContainer]}
        glassBackgroundColor={secondaryBackgroundColor}
        givenGlassBorderColor={secondaryBackgroundColor}
        blurBackground={blurSecondaryBackgroundColor}
        givenBlurBorderColor={blurSecondaryBackgroundColor}
      >
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
          <View style={styles.sendWrapper}>
            {item && (
              <PressableScale
                onPress={handleAdd}
                style={[
                  styles.sendButton,
                  { backgroundColor: secondaryBackgroundColor },
                ]}
              >
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
              </PressableScale>
            )}
          </View>
        </View>
      </GlassOrBlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 40,
  },
  innerContainer: {
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  textInput: { flex: 1, height: 32 },
  pillRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal styles
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
  },
  inputContext: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  editContent: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  modalInput: {
    padding: 8,
    fontSize: 18,
  },
  sendButtonModal: { marginTop: 23, alignSelf: "flex-end" },
  closeButtonModal: { alignSelf: "flex-start" },
  closeEditButton: {
    borderRadius: 9999,
    height: 40,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
})
