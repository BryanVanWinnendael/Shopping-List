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
import { CATEGORY_PRIORITY } from "@/lib/firebase"
import { PressableScale } from "pressto"
import { ListFilter } from "lucide-react-native"
import { CustomBottomSheet } from "@/components/customBottomSheet"
import BottomSheet from "@gorhom/bottom-sheet"
import { FilterSearch } from "@/components/search/filterSearch"

export default function Search() {
  const { theme } = useSettings()
  const headerHeight = useHeaderHeight()
  const snapPoints = useMemo(() => ["30%"], [])

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const flatListRef = useRef<FlatList>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ProductsSearchResult>({
    products: [],
    dateUpdated: "",
  })
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
        fetchProducts(query, categories)
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
      fetchProducts(text)
    }, 500)
  }

  const fetchProducts = async (text: string, categories?: Categories[]) => {
    if (!text.trim()) {
      setResults({ products: [], dateUpdated: "" })
      return
    }

    setLoading(true)
    try {
      const res = await searchProducts(text, categories ?? selectedCategories)
      if (res.products.length === 0) {
        setResults({ products: [], dateUpdated: "" })
        return
      }
      const sorted = res.products.sort((a, b) => {
        const aPriority =
          CATEGORY_PRIORITY[a.category] ?? Number.MAX_SAFE_INTEGER
        const bPriority =
          CATEGORY_PRIORITY[b.category] ?? Number.MAX_SAFE_INTEGER
        return aPriority - bPriority
      })

      setResults({ products: sorted, dateUpdated: res.dateUpdated })
    } catch (err) {
      console.error("Error fetching products:", err)
      setResults({ products: [], dateUpdated: "" })
    } finally {
      setLoading(false)
    }
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

        {loading && <ActivityIndicator size="small" color="#000" />}
        {results.dateUpdated && (
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
        )}

        <FlatList
          ref={flatListRef}
          data={results.products}
          keyExtractor={(item, index) => item.item + index}
          renderItem={({ item }) => {
            return <SearchItem key={item.item} item={item} />
          }}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
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
