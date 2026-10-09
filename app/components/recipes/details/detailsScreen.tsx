import { ActivityIndicator, StyleSheet, View } from "react-native"
import { router } from "expo-router"
import { useSharedValue } from "react-native-reanimated"
import RecipeContent from "@/components/recipes/details/content"
import BottomSheet from "@/components/recipes/update/bottomSheet"
import { useUpdateRecipeForm } from "@/hooks/recipes/useUpdateRecipeForm"
import useDeleteRecipe from "@/hooks/recipes/useDeleteRecipe"
import useThemes from "@/hooks/themes/useThemes"
import { Recipe } from "@/types/generated/models/recipe"
import Background from "@/components/recipes/details/background"
import Buttons from "@/components/recipes/details/buttons"

type Props = {
    recipe: Recipe
    setRecipe: (recipe: Recipe) => void
    open: () => void
}

export default function DetailsScreen({ recipe, setRecipe, open }: Props) {
    const { vars } = useThemes()
    const { actions: editRecipeFormActions, refs: editRecipeFormRefs } = useUpdateRecipeForm(recipe)
    const { actions: deleteRecipeActions, states: deleteRecipeStates } = useDeleteRecipe()

    const scrollY = useSharedValue(0)

    const deleteRecipe = async () => {
        const response = await deleteRecipeActions.deleteRecipe(recipe.id)

        if (response) {
            editRecipeFormActions.close()
            router.replace("/recipes")
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
            {recipe.title ? (
                <View style={styles.content}>
                    <Background recipe={recipe} scrollY={scrollY} />

                    <RecipeContent recipe={recipe} open={open} scrollY={scrollY} />
                </View>
            ) : (
                <ActivityIndicator style={styles.loader} color={vars.textColor} />
            )}

            <BottomSheet
                recipe={recipe}
                bottomSheetRef={editRecipeFormRefs.bottomSheetRef}
                close={editRecipeFormActions.close}
                deleteRecipe={deleteRecipe}
                updateRecipeDetails={setRecipe}
                deleteLoading={deleteRecipeStates.loading}
            />

            <Buttons recipe={recipe} open={editRecipeFormActions.open} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    loader: {
        marginTop: 50,
    },
})
