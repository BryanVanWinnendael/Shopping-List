import { useProductsSearch } from "@/hooks/products-search/useProductsSearch"
import { View } from "react-native"
import { SearchBar } from "@/components/products-search/searchBar"
import { List } from "@/components/products-search/list"
import CustomBottomSheet from "@/components/customBottomSheet"
import Filter from "@/components/products-search/filter"
import useThemes from "@/hooks/themes/useThemes"
import FilterButton from "@/components/products-search/filterButton"

export default function SearchProducts() {
    const { vars } = useThemes()
    const { states, actions, refs } = useProductsSearch()

    return (
        <>
            <View style={{ backgroundColor: vars.backgroundColor, flex: 1, paddingHorizontal: 16 }}>
                <SearchBar value={states.query} updateQuery={actions.updateQuery} />
                <FilterButton open={actions.open} />
                <List results={states.results} loading={states.loading} getNextPage={actions.getNextPage} />
            </View>

            <CustomBottomSheet sheetRef={refs.bottomSheetRef} onClose={actions.close} snapPoints={["30%"]}>
                <Filter selected={states.selectedCategories} onApply={actions.applyFilters} />
            </CustomBottomSheet>
        </>
    )
}
