import { useInteractions } from "@/stores/useInteractions"
import { useCallback, useEffect, useRef } from "react"
import { View, Text, FlatList } from "react-native"
import { CustomBottomSheet } from "../customBottomSheet"
import SearchItem from "../search/searchItem"
import { getTextColor } from "@/lib/theme"
import { useSettings } from "@/stores/useSettings"

export default function ItemSearchSheet() {
  const { theme } = useSettings()
  const { searchSheet, searchItemsResult, searchItems } = useInteractions()

  const flatListRef = useRef<FlatList>(null)

  const textColor = getTextColor(theme)

  const closeSheet = useCallback(() => {
    if (!searchSheet) return
    searchSheet.current?.close()
  }, [])

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true })
    }
  }, [searchItemsResult])

  return (
    searchSheet && (
      <CustomBottomSheet sheetRef={searchSheet} onClose={closeSheet}>
        <Text
          style={{
            marginBottom: 10,
            paddingLeft: 10,
            fontWeight: "500",
            color: textColor,
            opacity: 0.2,
          }}
        >
          Last updated: {searchItemsResult.dateUpdated}
        </Text>
        <View
          key={searchItems}
          style={{ flex: 1, paddingBottom: 20, maxHeight: 670 }}
        >
          <FlatList
            ref={flatListRef}
            data={searchItemsResult.products}
            extraData={searchItems}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item.item + index}
            renderItem={({ item }) => {
              return <SearchItem key={item.item} item={item} />
            }}
            ListEmptyComponent={() =>
              searchItemsResult.products.length === 0 ? (
                <Text style={{ paddingLeft: 10, marginTop: 10 }}>
                  No results found
                </Text>
              ) : null
            }
          />
        </View>
      </CustomBottomSheet>
    )
  )
}
