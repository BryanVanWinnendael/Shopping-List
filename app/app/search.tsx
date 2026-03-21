import { useHeaderHeight } from "@react-navigation/elements"
import { useState, useRef, useCallback, useMemo } from "react"
import {
  View,
  TextInput,
  FlatList,
  Text,
  ActivityIndicator,
} from "react-native"
import { searchProducts } from "@/lib/product-search"
import {
  getBackgroundColor,
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { useSettings } from "@/stores/useSettings"
import { Categories, ProductsSearchResult } from "@/types"
import SearchItem from "@/components/search/searchItem"
import { PressableScale } from "pressto"
import { ListFilter } from "lucide-react-native"
import { CustomBottomSheet } from "@/components/customBottomSheet"
import BottomSheet from "@gorhom/bottom-sheet"
import { FilterSearch } from "@/components/search/filterSearch"

const EMPTY_RESULT: ProductsSearchResult = {
  products: [],
  dateUpdated: "",
  page: 0,
  pageSize: 0,
  total: 0,
  totalPages: 0,
  category: "remaining",
  item: "",
}

export default function Search() {
  const { theme } = useSettings()
  const headerHeight = useHeaderHeight()
  const snapPoints = useMemo(() => ["30%"], [])

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const flatListRef = useRef<FlatList>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)
  const isFetching = useRef(false)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ProductsSearchResult>(EMPTY_RESULT)
  const [loading, setLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Categories[]>([])

  const backgroundColor = getBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close()
  }, [])

  const openSheet = useCallback(() => {
    bottomSheetRef.current?.expand()
  }, [])

  const applyFilters = useCallback(
    (categories: Categories[]) => {
      setSelectedCategories(categories)
      if (query.trim()) {
        fetchProducts(query, categories, 1, true)
      }
    },
    [query],
  )

  const handleChange = (text: string) => {
    setQuery(text)

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    debounceTimeout.current = setTimeout(() => {
      fetchProducts(text, selectedCategories, 1, true)
    }, 500)
  }

  const fetchProducts = async (
    text: string,
    categories: Categories[],
    page = 1,
    replace = false,
  ) => {
    if (!text.trim()) {
      setResults(EMPTY_RESULT)
      return
    }

    if (isFetching.current) return
    isFetching.current = true

    if (replace) setLoading(true)

    try {
      const res = await searchProducts(text, page, categories)

      setResults((prev) =>
        replace
          ? res
          : {
              ...prev,
              ...res,
              products: [...prev.products, ...res.products],
            },
      )
    } catch (err) {
      console.error("Error fetching products:", err)
      setResults(EMPTY_RESULT)
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }

  const fetchNextPage = () => {
    if (results.page >= results.totalPages) return
    fetchProducts(query, selectedCategories, results.page + 1, false)
  }

  return (
    <>
      <View
        style={{
          backgroundColor,
          paddingTop: headerHeight + 10,
          height: "100%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 10,
            marginBottom: 6,
          }}
        >
          <TextInput
            placeholderTextColor="#aaa"
            keyboardAppearance={theme === "light" ? "light" : "dark"}
            placeholder="Search products..."
            value={query}
            onChangeText={handleChange}
            style={{
              flex: 1,
              color: textColor,
              backgroundColor: secondaryBackgroundColor,
              borderWidth: 1,
              borderColor,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginRight: 8,
            }}
          />

          <PressableScale
            onPress={openSheet}
            style={{
              height: 35,
              width: 35,
              borderRadius: 8,
              backgroundColor: secondaryBackgroundColor,
              borderWidth: 1,
              borderColor,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ListFilter size={18} color={textColor} />
          </PressableScale>
        </View>

        {loading && <ActivityIndicator size="small" />}
        {results.dateUpdated && (
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
              Found results: {results.total}
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
              Last updated: {results.dateUpdated}
            </Text>
          </View>
        )}
        <FlatList
          ref={flatListRef}
          data={results.products}
          keyExtractor={(item, index) => item.item + index}
          renderItem={({ item }) => <SearchItem item={item} />}
          contentContainerStyle={{ paddingBottom: 40 }}
          onEndReached={fetchNextPage}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetching.current ? (
              <ActivityIndicator style={{ marginTop: 10 }} />
            ) : null
          }
          ListEmptyComponent={() =>
            !loading && query ? (
              <Text style={{ paddingLeft: 10, marginTop: 10 }}>
                No results found
              </Text>
            ) : null
          }
        />
      </View>

      <CustomBottomSheet
        onClose={closeSheet}
        sheetRef={bottomSheetRef}
        snapPoints={snapPoints}
      >
        <FilterSearch selected={selectedCategories} onApply={applyFilters} />
      </CustomBottomSheet>
    </>
  )
}
