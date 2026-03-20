import { View, StyleSheet } from "react-native"
import { useSettings } from "@/stores/useSettings"
import { getBackgroundColor } from "@/lib/theme"
import List from "@/components/list/list"
import Input from "@/components/inputs/input"

export default function Index() {
  const { theme } = useSettings()

  const backgroundColor = getBackgroundColor(theme)

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <List />
      <View pointerEvents="box-none" style={styles.inputOverlay}>
        <Input />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  inputOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "auto",
    backgroundColor: "transparent",
    display: "flex",
    justifyContent: "flex-end",
  },
})
