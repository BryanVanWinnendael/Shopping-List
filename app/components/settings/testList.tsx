import { View, Text, StyleSheet } from "react-native"
import { useSettings } from "@/stores/useSettings"
import {
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { PressableScale } from "pressto"
import { CATEGORY_ORDER } from "@/lib/constants"
import { addTestItem, deleteItem } from "@/lib/firebase"
import uuid from "react-native-uuid"
import { useInteractions } from "@/stores/useInteractions"

export function TestList() {
  const { theme, user } = useSettings()
  const { items } = useInteractions()

  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const textColor = getTextColor(theme)
  const borderColor = getBorderColor(theme)

  const handleAddTestList = async () => {
    if (!user) return

    await Promise.all(
      CATEGORY_ORDER.map((category) =>
        addTestItem({
          id: uuid.v4(),
          item: category,
          type: "text",
          addedBy: user,
          addedAt: Date.now(),
          category,
        }),
      ),
    )
  }

  const handleRemoveTestList = async () => {
    if (!items) return

    for (const item of Object.values(items)) {
      await deleteItem(item)
    }
  }

  return (
    <>
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
          <Text style={[styles.title, { color: textColor }]}>
            Test Add List
          </Text>
          <PressableScale
            style={[styles.button, { borderColor: borderColor }]}
            onPress={handleAddTestList}
          >
            <Text style={[styles.buttonText, { color: textColor }]}>
              Add Test Items
            </Text>
          </PressableScale>
        </View>
      </View>
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
          <Text style={[styles.title, { color: textColor }]}>
            Test Remove List
          </Text>
          <PressableScale
            style={[styles.button, { borderColor: borderColor }]}
            onPress={handleRemoveTestList}
          >
            <Text style={[styles.buttonText, { color: textColor }]}>
              Remove All Items
            </Text>
          </PressableScale>
        </View>
      </View>
    </>
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
  containerTest: {
    flexDirection: "row",
    gap: 15,
  },
})
