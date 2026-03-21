import { useInteractions } from "@/stores/useInteractions"
import { useCallback, useEffect, useRef } from "react"
import { View, Text, FlatList } from "react-native"
import { CustomBottomSheet } from "../customBottomSheet"
import SearchItem from "../search/searchItem"
import { getTextColor } from "@/lib/theme"
import { useSettings } from "@/stores/useSettings"
import { fuzzySearchProducts } from "@/lib/product-search"

export default function ItemSearchSheet() {
  const { theme } = useSettings()
  const { searchSheet, searchItemsResult, searchItems, setSearchItemsResult } =
    useInteractions()

  const flatListRef = useRef<FlatList>(null)
  const isFetching = useRef(false)

  const textColor = getTextColor(theme)

  const { page, totalPages, item, category, products, total, dateUpdated } =
    searchItemsResult

  const closeSheet = useCallback(() => {
    searchSheet?.current?.close()
  }, [searchSheet])

  const fetchPage = async () => {
    const nextPage = page + 1
    if (nextPage > totalPages || isFetching.current) return

    try {
      isFetching.current = true
      const res = await fuzzySearchProducts(item, category, nextPage)
      setSearchItemsResult({
        ...res,
        products: [...products, ...res.products],
      })
    } finally {
      isFetching.current = false
    }
  }

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
  }, [searchItemsResult.item, searchItemsResult.category])

  return (
    searchSheet && (
      <CustomBottomSheet sheetRef={searchSheet} onClose={closeSheet}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginRight: 8,
          }}
        >
          <Text
            style={{
              marginBottom: 10,
              paddingLeft: 10,
              fontWeight: "500",
              color: textColor,
              opacity: 0.2,
            }}
          >
            Found results: {total}
          </Text>
          <Text
            style={{
              marginBottom: 10,
              paddingLeft: 10,
              fontWeight: "500",
              color: textColor,
              opacity: 0.2,
            }}
          >
            Last updated: {dateUpdated}
          </Text>
        </View>
        <View style={{ flex: 1, paddingBottom: 20, maxHeight: 670 }}>
          <FlatList
            ref={flatListRef}
            data={searchItemsResult.products}
            extraData={searchItems}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item.item + index}
            renderItem={({ item }) => (
              <SearchItem key={item.item} item={item} />
            )}
            ListEmptyComponent={() =>
              searchItemsResult.products.length === 0 ? (
                <Text
                  style={{ paddingLeft: 10, marginTop: 10, color: textColor }}
                >
                  No results found
                </Text>
              ) : null
            }
            onEndReached={fetchPage}
            onEndReachedThreshold={0.5}
          />
        </View>
      </CustomBottomSheet>
    )
  )
}
