import { useRef, useMemo, useCallback, useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"
import BottomSheet from "@gorhom/bottom-sheet"
import { useSettings } from "@/stores/useSettings"
import { Check } from "lucide-react-native"
import { getTextColor } from "@/lib/theme"
import { Users } from "@/types"
import { CustomBottomSheet } from "../customBottomSheet"
import { PressableScale } from "pressto"
import { USERS_ARRAY } from "@/lib/constants"

export function UserSheet() {
  const { user, setUser, theme, showUserSheet, setShowUserSheet, aColor } =
    useSettings()
  const snapPoints = useMemo(() => ["30%"], [])

  const bottomSheetRef = useRef<BottomSheet>(null)

  const textColor = getTextColor(theme)

  const closeSheet = useCallback(() => {
    setShowUserSheet(false)
  }, [setShowUserSheet])

  const handleUserChange = useCallback(
    async (newUser: Users) => {
      await setUser(newUser)
      closeSheet()
    },
    [setUser, closeSheet],
  )

  useEffect(() => {
    if (bottomSheetRef.current) {
      if (showUserSheet) bottomSheetRef.current.expand()
      else bottomSheetRef.current.close()
    }
  }, [showUserSheet])

  return (
    <CustomBottomSheet
      sheetRef={bottomSheetRef}
      onClose={closeSheet}
      snapPoints={snapPoints}
      backgroundMode="glass"
    >
      <Text
        style={[
          styles.sheetTitle,
          { color: theme === "light" ? "gray" : "#50555C" },
        ]}
      >
        Select User
      </Text>

      {USERS_ARRAY.map((u) => {
        const isSelected = user === u
        return (
          <PressableScale
            key={u}
            onPress={() => handleUserChange(u)}
            style={styles.userOptionContainer}
          >
            <Text
              style={{
                color: textColor,
                fontSize: 16,
              }}
            >
              {u}
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
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  userOptionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
})
