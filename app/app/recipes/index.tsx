import { View } from "react-native"
import List from "@/components/recipes/list/list"
import RecipesFilterBottomSheetButton from "@/components/recipes/filter/bottomSheetButton"
import AddRecipeBottomSheet from "@/components/recipes/create/bottomSheet"
import { useCreateRecipeForm } from "@/hooks/recipes/useCreateRecipeForm"
import { useRecipesFilter } from "@/hooks/recipes/useRecipesFilter"
import RecipesFilterBottomSheet from "@/components/recipes/filter/bottomSheet"
import AddRecipeBottomSheetButton from "@/components/recipes/create/bottomSheetButton"
import useThemes from "@/hooks/themes/useThemes"

export default function Recipes() {
    const { vars } = useThemes()

    const { refs: formRefs, actions: formActions } = useCreateRecipeForm()
    const { refs: filterRefs, actions: filterActions } = useRecipesFilter()

    return (
        <View
            style={{
                backgroundColor: vars.backgroundColor,
                flex: 1,
                padding: 16,
            }}
        >
            <List />

            <AddRecipeBottomSheetButton onPress={formActions.open} />
            <AddRecipeBottomSheet sheetRef={formRefs.bottomSheetRef} onClose={formActions.close} />

            <RecipesFilterBottomSheetButton onPress={filterActions.open} />
            <RecipesFilterBottomSheet sheetRef={filterRefs.bottomSheetRef} onClose={filterActions.close} />
        </View>
    )
}
