import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
} from "react-native"
import { useSettings } from "@/stores/useSettings"
import {
  getBackgroundColor,
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { Categories as CategoriesType, CronType } from "@/types"
import { useRef, useState, useCallback, useEffect } from "react"
import BottomSheet from "@gorhom/bottom-sheet"
import { useHeaderHeight } from "@react-navigation/elements"
import { CATEGORY_ORDER } from "@/lib/constants"
import { getCronItems, updateCronItemCategory } from "@/lib/cron"
import CategoryIcon from "@/components/categoryIcon"
import Svg, { Path } from "react-native-svg"
import { addCategory } from "@/lib/categories"
import { CustomBottomSheet } from "@/components/customBottomSheet"
import { PressableScale } from "pressto"
import { useInteractions } from "@/stores/useInteractions"

export default function WeeklyCategories() {
  const { theme } = useSettings()
  const { setError } = useInteractions()
  const headerHeight = useHeaderHeight()

  const bottomSheetRef = useRef<BottomSheet>(null)

  const [items, setItems] = useState<CronType[]>([])
  const [selectedItem, setSelectedItem] = useState<CronType | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const backgroundColor = getBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const textColor = getTextColor(theme)
  const borderColor = getBorderColor(theme)

  const getItems = async () => {
    const res = await getCronItems()
    setItems(res)
  }

  const openBottomSheet = (item: CronType) => {
    setSelectedItem(item)
    bottomSheetRef.current?.expand()
  }

  const closeSheet = useCallback(() => {
    setSelectedItem(null)
    bottomSheetRef.current?.close()
  }, [])

  const handleChangeCategory = async (category: CategoriesType) => {
    if (!selectedItem || !selectedItem.id) return

    const updated = await updateCronItemCategory(selectedItem.id, category)
    if (!updated) setError("Failed to update cron item")
    const added = await addCategory(category, selectedItem.item)
    if (!added) setError("Failed to add category")

    getItems()
    bottomSheetRef.current?.close()
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await getItems()
    setRefreshing(false)
  }

  useEffect(() => {
    getItems()
  }, [])

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
      <PressableScale onPress={() => openBottomSheet(item)}>
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path
            d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z"
            stroke={textColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13"
            stroke={textColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </PressableScale>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <FlatList
        contentContainerStyle={styles.flatListContent}
        data={items}
        ListHeaderComponent={<View style={{ height: headerHeight }} />}
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

      <CustomBottomSheet sheetRef={bottomSheetRef} onClose={closeSheet}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 12,
            color: textColor,
          }}
        >
          Select New Category
        </Text>

        <ScrollView
          style={{ height: 670 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {CATEGORY_ORDER.map((category) => (
            <PressableScale
              key={category}
              onPress={() => handleChangeCategory(category)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                marginBottom: 8,
                borderRadius: 10,
                backgroundColor: secondaryBackgroundColor,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: textColor,
                  fontWeight: "500",
                }}
              >
                {category}
              </Text>
            </PressableScale>
          ))}
        </ScrollView>
      </CustomBottomSheet>
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
