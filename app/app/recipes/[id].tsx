import DetailsScreen from "@/components/recipes/details/detailsScreen"
import { useRecipeDetails } from "@/hooks/recipes/useRecipeDetails"
import InstructionsBottomSheet from "@/components/recipes/details/instructionsBottomSheet"

export default function RecipeDetails() {
    const { actions, states, refs } = useRecipeDetails()

    return (
        <>
            <DetailsScreen recipe={states.recipe} setRecipe={actions.setRecipe} open={actions.open} />

            <InstructionsBottomSheet
                sheetRef={refs.sheetRef}
                close={actions.close}
                instructions={states.recipe?.instructions ?? []}
            />
        </>
    )
}
