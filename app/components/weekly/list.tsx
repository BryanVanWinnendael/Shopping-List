import { useEffect, useState } from "react"
import { View, StyleSheet, FlatList, Text, RefreshControl } from "react-native"
import { CronType } from "@/types"
import { useHeaderHeight } from "@react-navigation/elements"
import { useSettings } from "@/stores/useSettings"
import CategoryIcon from "../categoryIcon"
import {
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { Info } from "lucide-react-native"
import Svg, { Path } from "react-native-svg"
import { PressableScale } from "pressto"

type Props = {
  handleDeleteCronItem: (id: string | undefined) => void
  items: CronType[]
  getItems: () => Promise<void>
}

export default function List({ handleDeleteCronItem, items, getItems }: Props) {
  const { user, theme, aColor } = useSettings()
  const headerHeight = useHeaderHeight()

  const [refreshing, setRefreshing] = useState(false)

  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

  const onRefresh = async () => {
    setRefreshing(true)
    await getItems()
    setRefreshing(false)
  }

  useEffect(() => {
    getItems()
  }, [user])

  const renderItem = (item: CronType) => (
    <View
      style={[
        styles.renderItem,
        {
          backgroundColor: secondaryBackgroundColor,
          borderColor: borderColor,
          borderWidth: 0.2,
        },
      ]}
    >
      <CategoryIcon category={item.category} theme={theme} />
      <Text style={[styles.title, { color: textColor, flex: 1 }]}>
        {item.item}
      </Text>
      <PressableScale onPress={() => handleDeleteCronItem(item.id)}>
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 5H18M9 5V5C10.5769 3.16026 13.4231 3.16026 15 5V5M9 20H15C16.1046 20 17 19.1046 17 18V9C17 8.44772 16.5523 8 16 8H8C7.44772 8 7 8.44772 7 9V18C7 19.1046 7.89543 20 9 20Z"
            stroke={theme === "light" ? "black" : "white"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </PressableScale>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={{ width: "100%" }}>
        <View style={{ height: headerHeight }} />
        <View
          style={{
            backgroundColor: `${aColor}33`,
            borderRadius: 12,
            padding: 12,
            marginHorizontal: 8,
            marginBottom: 16,
            marginTop: 10,
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
          }}
        >
          <Info color={aColor} />
          <Text style={{ fontSize: 15, color: aColor }}>
            Items in this list get automatically added every Friday to the
            shopping list.
          </Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.flatListContent}
        data={items}
        renderItem={({ item }) => renderItem(item)}
        keyExtractor={(_, index) => String(index)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: textColor }}>No weekly items found.</Text>
          </View>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={textColor}
            colors={[textColor]}
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  flatListContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  renderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 6,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
  },
})
