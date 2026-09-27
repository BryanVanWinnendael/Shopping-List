import { BlurView } from "expo-blur"
import { RefObject, useEffect } from "react"
import { Text, View } from "react-native"

import { useProductsSearch } from "@/hooks/products-search/useProductsSearch"
import { SearchBar } from "@/components/products-search/searchBar"
import { List } from "@/components/products-search/list"
import Filter from "@/components/products-search/filter"
import useThemes from "@/hooks/themes/useThemes"
import FilterButton from "@/components/products-search/filterButton"
import AppBottomSheet, { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import { useRecipesStore } from "@/stores/useRecipesStore"

export default function SearchProducts() {
    const { vars, appearance } = useThemes()
    const { states, actions, refs } = useProductsSearch()
    const { loadUserRecipes } = useRecipesStore()

    useEffect(() => {
        loadUserRecipes()
    }, [])

    return (
        <>
            <View
                style={{
                    backgroundColor: vars.backgroundColor,
                    flex: 1,
                    paddingHorizontal: 12,
                }}
            >
                <SearchBar value={states.query} updateQuery={actions.updateQuery} />

                <FilterButton open={actions.open} />

                <List results={states.results} loading={states.loading} getNextPage={actions.getNextPage} />
            </View>

            <AppBottomSheet
                ref={refs.bottomSheetRef as RefObject<BottomSheetRef | null>}
                index={-1}
                snapPoints={["40%", "55%"]}
                enablePanDownToClose
                onClose={actions.close}
                backgroundMode="adaptive"
            >
                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            position: "absolute",
                            top: -40,
                            left: 0,
                            right: 0,
                            height: 88,
                            zIndex: 10,
                            overflow: "hidden",
                        }}
                    >
                        <BlurView
                            intensity={18}
                            tint={appearance}
                            style={{
                                flex: 1,
                                paddingHorizontal: 20,
                                paddingTop: 48,
                                paddingBottom: 10,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 22,
                                    fontWeight: "700",
                                    color: vars.textColor,
                                }}
                            >
                                Filter Products
                            </Text>
                        </BlurView>
                    </View>

                    <Filter selected={states.selectedCategories} onApply={actions.applyFilters} />
                </View>
            </AppBottomSheet>
        </>
    )
}
