import { ActivityIndicator, View } from "react-native"
import { useHeaderHeight } from "@react-navigation/elements"
import Header from "@/components/recipes/details/header"
import RecipeContent from "@/components/recipes/details/content"
import Background from "@/components/recipes/details/background"
import BottomSheet from "@/components/recipes/update/bottomSheet"
import { useUpdateRecipeForm } from "@/hooks/recipes/useUpdateRecipeForm"
import { useState } from "react"
import useThemes from "@/hooks/themes/useThemes"
import useDeleteRecipe from "@/hooks/recipes/useDeleteRecipe"
import { router } from "expo-router"
import { Recipe } from "@/types/generated/models/recipe"

type Props = {
    recipe: Recipe
    setRecipe: (recipe: Recipe) => void
    open: () => void
}

export default function DetailsScreen({ recipe, setRecipe, open }: Props) {
    const { vars } = useThemes()
    const headerHeight = useHeaderHeight()

    const { actions: editRecipeFormActions, refs: editRecipeFormRefs } = useUpdateRecipeForm(recipe)
    const { actions: deleteRecipeActions, states: deleteRecipeStates } = useDeleteRecipe()

    const [offset, setOffset] = useState(0)

    const deleteRecipe = async () => {
        const response = await deleteRecipeActions.deleteRecipe(recipe.id)
        if (response) {
            editRecipeFormActions.close()
            router.replace("/recipes")
        }
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: vars.backgroundColor,
                paddingTop: headerHeight - 40,
            }}
        >
            <Background recipe={recipe} open={editRecipeFormActions.open} />

            {recipe.title ? (
                <>
                    <Header recipe={recipe} headerHeight={headerHeight} setOffset={setOffset} />

                    <RecipeContent recipe={recipe} offset={offset} open={open} />

                    <BottomSheet
                        recipe={recipe}
                        bottomSheetRef={editRecipeFormRefs.bottomSheetRef}
                        close={editRecipeFormActions.close}
                        deleteRecipe={deleteRecipe}
                        updateRecipeDetails={setRecipe}
                        deleteLoading={deleteRecipeStates.loading}
                    />
                </>
            ) : (
                <ActivityIndicator style={{ marginTop: 50 }} color={vars.textColor} />
            )}
        </View>
    )
}
