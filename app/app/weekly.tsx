import { useState } from "react"
import { StyleSheet, View } from "react-native"
import Input from "@/components/weekly/input"
import { getCategory } from "@/lib/categories"
import { addCronItem, deleteCronItem, getCronItemsByUser } from "@/lib/cron"
import { getBackgroundColor } from "@/lib/theme"
import { useSettings } from "@/stores/useSettings"
import * as Haptics from "expo-haptics"
import { CronType } from "@/types"
import List from "@/components/weekly/list"
import { useInteractions } from "@/stores/useInteractions"

export default function Categories() {
  const { theme, user } = useSettings()
  const { setError } = useInteractions()

  const [item, setItem] = useState<string>("")
  const [items, setItems] = useState<CronType[]>([])
  const [loading, setLoading] = useState(false)

  const getItems = async () => {
    if (!user) return
    const res = await getCronItemsByUser(user)
    setItems(res)
  }

  const handleAdd = async () => {
    if (!item || item === "" || !user) return
    let trimmedItem = item.trim()
    if (trimmedItem.endsWith(".")) {
      trimmedItem = trimmedItem.slice(0, -1)
    }
    setLoading(true)
    const category = await getCategory(item)

    const newItem: CronType = {
      item: trimmedItem,
      addedBy: user,
      category: category,
    }

    const added = await addCronItem(newItem)
    if (!added) setError("Failed to add cron item")
    setItem("")
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setLoading(false)
    getItems()
  }

  const handleDeleteCronItem = async (id: string | undefined) => {
    if (!id) return
    const deleted = await deleteCronItem(id)
    if (!deleted) setError("Failed to delete cron item")
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    getItems()
  }

  return (
    <View
      style={[styles.container, { backgroundColor: getBackgroundColor(theme) }]}
    >
      <List
        getItems={getItems}
        handleDeleteCronItem={handleDeleteCronItem}
        items={items}
      />

      <View pointerEvents="box-none" style={styles.inputOverlay}>
        <Input
          handleAdd={handleAdd}
          setItem={setItem}
          item={item}
          loading={loading}
        />
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
    height: "100%",
    backgroundColor: "transparent",
    display: "flex",
    justifyContent: "flex-end",
  },
})
