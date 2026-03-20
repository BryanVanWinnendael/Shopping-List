import { useRef, useMemo, useCallback, useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"
import BottomSheet from "@gorhom/bottom-sheet"
import { useSettings } from "@/stores/useSettings"
import { Theme } from "@/types"
import { Check } from "lucide-react-native"
import { getTextColor } from "@/lib/theme"
import { CustomBottomSheet } from "../customBottomSheet"
import { PressableScale } from "pressto"

const THEMES: { key: Theme; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "true dark", label: "True Dark" },
]

export function ThemeSwitcherSheet() {
  const { theme, setTheme, setShowThemeSheet, showThemeSheet, aColor } =
    useSettings()
  const snapPoints = useMemo(() => ["20%"], [])

  const bottomSheetRef = useRef<BottomSheet>(null)

  const textColor = getTextColor(theme)

  const closeSheet = useCallback(() => {
    setShowThemeSheet(false)
  }, [setShowThemeSheet])

  const selectTheme = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme)
    },
    [setTheme],
  )

  useEffect(() => {
    if (bottomSheetRef.current) {
      if (showThemeSheet) bottomSheetRef.current.expand()
      else bottomSheetRef.current.close()
    }
  }, [showThemeSheet])

  return (
    <CustomBottomSheet
      sheetRef={bottomSheetRef}
      snapPoints={snapPoints}
      onClose={closeSheet}
      backgroundMode="glass"
    >
      <Text
        style={[
          styles.sheetTitle,
          { color: theme === "light" ? "gray" : "#50555C" },
        ]}
      >
        Select Theme
      </Text>

      {THEMES.map((item) => {
        const isSelected = theme === item.key
        return (
          <PressableScale
            key={item.key}
            onPress={() => selectTheme(item.key)}
            style={styles.themeOptionContainer}
          >
            <Text
              style={{
                color: textColor,
                fontSize: 16,
              }}
            >
              {item.label}
            </Text>

            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: isSelected ? aColor : "gray",
                backgroundColor: isSelected ? aColor : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSelected && <Check size={14} color="white" strokeWidth={3} />}
            </View>
          </PressableScale>
        )
      })}
    </CustomBottomSheet>
  )
}

const styles = StyleSheet.create({
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  themeOptionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
})
