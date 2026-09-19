import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { RefObject, useEffect } from "react"
import { Text, View } from "react-native"

import { useProductsSearch } from "@/hooks/products-search/useProductsSearch"
import { SearchBar } from "@/components/products-search/searchBar"
import { List } from "@/components/products-search/list"
import Filter from "@/components/products-search/filter"
import useThemes from "@/hooks/themes/useThemes"
import FilterButton from "@/components/products-search/filterButton"
import AppBottomSheet, { BottomSheetRef } from "@/components/native/appBottomSheet"
import { useRecipesStore } from "@/stores/useRecipesStore"

export default function SearchProducts() {
    const { vars, theme } = useThemes()
    const { states, actions, refs } = useProductsSearch()
    const { loadUserRecipes } = useRecipesStore()

    const backgroundColor = theme === "dark" ? "#080808" : theme === "true dark" ? "#000000" : "#FFFFFF"

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
                backgroundColor={backgroundColor}
            >
                <View style={{ flex: 1 }}>
                    {/* Header */}
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
                            tint={theme === "light" ? "light" : "dark"}
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

                        <LinearGradient
                            pointerEvents="none"
                            colors={["transparent", `${backgroundColor}20`, `${backgroundColor}70`, backgroundColor]}
                            locations={[0, 0.35, 0.75, 1]}
                            style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                bottom: 0,
                                height: 12,
                            }}
                        />
                    </View>

                    <Filter selected={states.selectedCategories} onApply={actions.applyFilters} />
                </View>
            </AppBottomSheet>
        </>
    )
}
