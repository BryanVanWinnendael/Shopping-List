import { View, Text, StyleSheet } from "react-native"
import { useSettings } from "@/stores/useSettings"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { PressableScale } from "pressto"

export function ClearStorage() {
  const { theme } = useSettings()

  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const textColor = getTextColor(theme)
  const borderColor = getBorderColor(theme)

  const handleClearStorage = async () => {
    AsyncStorage.clear()
  }

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
      <View style={styles.row}>
        <Text style={[styles.title, { color: textColor }]}>Clear Storage</Text>

        <PressableScale
          style={[styles.button, { borderColor: borderColor }]}
          onPress={handleClearStorage}
        >
          <Text style={[styles.buttonText, { color: textColor }]}>Clear</Text>
        </PressableScale>
      </View>
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
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 15,
  },
})
