import { StyleSheet, View } from "react-native"
import { useSettings } from "@/stores/useSettings"
import { Moon, Sun } from "lucide-react-native"
import { PressableScale } from "pressto"

export function ThemeSwitcher() {
  const { theme, setShowThemeSheet } = useSettings()

  const openSheet = () => {
    setShowThemeSheet(true)
  }

  return (
    <View style={{ marginLeft: 16 }}>
      <PressableScale onPress={openSheet} style={styles.iconButton}>
        {theme === "light" ? (
          <Sun size={20} color="black" />
        ) : (
          <Moon size={20} color="white" />
        )}
      </PressableScale>
    </View>
  )
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  option: {
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
  },
})
