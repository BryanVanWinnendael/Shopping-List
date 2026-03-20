import { View, StyleSheet, Text } from "react-native"
import { DrawerItemList } from "@react-navigation/drawer"
import { SafeAreaView } from "react-native-safe-area-context"
import { ThemeSwitcher } from "./themes/themeSwitcher"
import { useSettings } from "@/stores/useSettings"
import { getBackgroundColor, getSecondaryBackgroundColor } from "@/lib/theme"
import DevScreen from "./devScreen"
import { PressableScale } from "pressto"
import { IS_DEV } from "@/lib/constants"

export function CustomDrawerContent(props: any) {
  const { theme, setShowUserSheet, user } = useSettings()

  const backgroundColor = getBackgroundColor(theme)
  const secondaryBackground = getSecondaryBackgroundColor(theme)

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{
        flex: 1,
        justifyContent: "space-between",
        backgroundColor,
      }}
    >
      <View style={{ paddingLeft: 8, paddingRight: 8 }}>
        <PressableScale
          style={[styles.button, { backgroundColor: secondaryBackground }]}
          onPress={() => setShowUserSheet(true)}
        >
          <Text
            style={{
              color: theme === "light" ? "#5C5C5C" : "#88888C",
              fontSize: 16,
            }}
          >
            {user || "None"}
          </Text>
        </PressableScale>
        <DrawerItemList {...props} />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ThemeSwitcher />
        {IS_DEV && <DevScreen />}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    margin: 16,
  },
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
