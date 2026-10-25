import { useEffect } from "react"
import DetailsScreen from "@/components/recipes/details/detailsScreen"
import { useRecipeDetails } from "@/hooks/recipes/useRecipeDetails"
import InstructionsBottomSheet from "@/components/recipes/details/instructionsBottomSheet"
import { useAiContextStore } from "@/stores/useAiContextStore"

export default function RecipeDetails() {
    const { actions, states, refs } = useRecipeDetails()
    const setRecipeContext = useAiContextStore((state) => state.setRecipe)

    useEffect(() => {
        if (!states.recipe?.id) return
        setRecipeContext(states.recipe)
    }, [states.recipe, setRecipeContext])

    useEffect(() => {
        return () => setRecipeContext(null)
    }, [setRecipeContext])

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
