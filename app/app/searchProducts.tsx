import { BlurView } from "expo-blur"
import { RefObject, useEffect } from "react"
import { StyleSheet, Text, View } from "react-native"

import { useProductsSearch } from "@/hooks/products-search/useProductsSearch"
import { SearchBar } from "@/components/products-search/searchBar"
import { List } from "@/components/products-search/list"
import Filter from "@/components/products-search/filter"
import FilterButton from "@/components/products-search/filterButton"
import AppBottomSheet, { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import useThemes from "@/hooks/themes/useThemes"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { useAiContextStore } from "@/stores/useAiContextStore"

const SNAP_POINTS = ["40%", "55%"]

export default function SearchProducts() {
    const { vars, appearance } = useThemes()
    const { states, actions, refs } = useProductsSearch()
    const loadUserRecipes = useRecipesStore((state) => state.loadUserRecipes)
    const setSearchSnapshot = useAiContextStore((state) => state.setSearchSnapshot)

    useEffect(() => {
        loadUserRecipes()
    }, [loadUserRecipes])

    useEffect(() => {
        setSearchSnapshot({ query: states.query, products: states.results.products })
    }, [states.query, states.results.products, setSearchSnapshot])

    return (
        <>
            <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
                <SearchBar value={states.query} updateQuery={actions.updateQuery} />

                <FilterButton open={actions.open} count={states.selectedCategories.length} />

                <List results={states.results} loading={states.loading} getNextPage={actions.getNextPage} />
            </View>

            <AppBottomSheet
                ref={refs.bottomSheetRef as RefObject<BottomSheetRef | null>}
                index={-1}
                snapPoints={SNAP_POINTS}
                enablePanDownToClose
                onClose={actions.close}
                backgroundMode="adaptive"
            >
                <View style={styles.sheetContent}>
                    <View style={styles.headerOverlay}>
                        <BlurView intensity={18} tint={appearance} style={styles.headerBlur}>
                            <Text style={[styles.headerTitle, { color: vars.textColor }]}>Filter Products</Text>
                        </BlurView>
                    </View>

                    <Filter
                        selected={states.selectedCategories}
                        onApply={actions.applyFilters}
                        onClose={actions.close}
                    />
                </View>
            </AppBottomSheet>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
    },
    sheetContent: {
        flex: 1,
    },
    headerOverlay: {
        position: "absolute",
        top: -40,
        left: 0,
        right: 0,
        height: 88,
        zIndex: 10,
        overflow: "hidden",
    },
    headerBlur: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
    },
})
