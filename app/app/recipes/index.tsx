import { View } from "react-native"
import List from "@/components/recipes/list/list"
import RecipesFilterBottomSheetButton from "@/components/recipes/filter/bottomSheetButton"
import AddRecipeBottomSheet from "@/components/recipes/create/bottomSheet"
import { useCreateRecipeForm } from "@/hooks/recipes/useCreateRecipeForm"
import { useRecipesFilter } from "@/hooks/recipes/useRecipesFilter"
import RecipesFilterBottomSheet from "@/components/recipes/filter/bottomSheet"
import AddRecipeBottomSheetButton from "@/components/recipes/create/bottomSheetButton"
import useThemes from "@/hooks/themes/useThemes"
import { useRecipeList } from "@/hooks/recipes/useRecipeList"
import { SearchBar } from "@/components/recipes/list/searchBar"
import { useState } from "react"

export default function Recipes() {
    const { vars } = useThemes()

    const { refs: formRefs, actions: formActions } = useCreateRecipeForm()
    const { refs: filterRefs, actions: filterActions } = useRecipesFilter()
    const { actions: recipesListActions, states: recipesListStates } = useRecipeList()

    const [filterExpanded, setFilterExpanded] = useState(false)

    return (
        <View
            style={{
                backgroundColor: vars.backgroundColor,
                flex: 1,
                padding: 16,
            }}
        >
            <SearchBar
                value={recipesListStates.query}
                updateQuery={recipesListActions.updateQuery}
                filterExpanded={filterExpanded}
                onSearchPress={() => setFilterExpanded(false)}
            />

            <List
                favoriteRecipes={recipesListStates.favoriteRecipes}
                toggleFavorite={recipesListActions.toggleFavorite}
                loading={recipesListStates.loading}
                refreshing={recipesListStates.refreshing}
                refresh={recipesListActions.refresh}
                sections={recipesListStates.sections}
                getNextPage={recipesListActions.getNextPage}
            />

            <RecipesFilterBottomSheetButton
                onPress={filterActions.open}
                onExpandedChange={setFilterExpanded}
                setExpanded={setFilterExpanded}
                expanded={filterExpanded}
            />
            <RecipesFilterBottomSheet sheetRef={filterRefs.bottomSheetRef} onClose={filterActions.close} />

            <AddRecipeBottomSheetButton onPress={formActions.open} />
            <AddRecipeBottomSheet sheetRef={formRefs.bottomSheetRef} onClose={formActions.close} />
        </View>
    )
}
