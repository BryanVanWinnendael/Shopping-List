import { View, Text, Switch, StyleSheet } from "react-native"
import {
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { useSettings } from "@/stores/useSettings"

export default function MenuIcon() {
  const { aColor, setMenuIcon, theme, menuIcon } = useSettings()

  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

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
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: textColor }]}>
            Show Menu Icon
          </Text>
          <Text
            style={[
              styles.description,
              { color: theme === "light" ? "#9ca3af" : "#50555C" },
            ]}
          >
            Show menu icon instead of user profile in header.
          </Text>
        </View>
        <Switch
          value={menuIcon}
          onValueChange={(val) => setMenuIcon(val)}
          trackColor={{ false: "#767577", true: aColor }}
          ios_backgroundColor="#767577"
          thumbColor={menuIcon ? "#fff" : "#f4f3f4"}
        />
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
  textBlock: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
  },
  description: {
    fontSize: 12,
    marginTop: 2,
  },
})
