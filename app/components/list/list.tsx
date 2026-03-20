import { useEffect, useRef } from "react"
import { View, StyleSheet, FlatList } from "react-native"
import { getItems, deleteItem } from "@/lib/firebase"
import { ItemType } from "@/types"
import { useHeaderHeight } from "@react-navigation/elements"
import { useSettings } from "@/stores/useSettings"
import { useInteractions } from "@/stores/useInteractions"
import Item from "./item"

export default function List() {
  const { handleNotification, items, setItems } = useInteractions()
  const { setEditItem, user } = useSettings()
  const headerHeight = useHeaderHeight()
  const scrollRef = useRef<FlatList>(null)

  const handleDelete = async (item: ItemType) => {
    await deleteItem(item)
    handleNotification("removed", user)
  }

  const handleEdit = (item: ItemType) => {
    setEditItem(item)
  }

  useEffect(() => {
    getItems(setItems)
  }, [setItems])

  const itemList = items ? Object.values(items) : []

  return (
    <View style={styles.container}>
      <FlatList
        ref={scrollRef}
        data={itemList}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: headerHeight + 85,
        }}
        renderItem={({ item }) => (
          <Item
            item={item}
            onDelete={handleDelete}
            scrollRef={scrollRef}
            onEdit={handleEdit}
          />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
  },
})
