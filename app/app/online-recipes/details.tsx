import { useEffect } from "react"
import useOnlineRecipeDetails from "@/hooks/recipes/useOnlineRecipeDetails"
import DetailsScreen from "@/components/online-recipes/details/detailsScreen"
import InstructionsBottomSheet from "@/components/recipes/details/instructionsBottomSheet"
import { useAiContextStore } from "@/stores/useAiContextStore"

export default function OnlineRecipeDetails() {
    const { actions, states, refs } = useOnlineRecipeDetails()
    const setOnlineRecipe = useAiContextStore((state) => state.setOnlineRecipe)

    useEffect(() => {
        setOnlineRecipe(states.recipe)
    }, [states.recipe, setOnlineRecipe])

    useEffect(() => {
        return () => setOnlineRecipe(null)
    }, [setOnlineRecipe])

    return (
        <>
            <DetailsScreen recipe={states.recipe} open={actions.open} />
            <InstructionsBottomSheet
                sheetRef={refs.sheetRef}
                close={actions.close}
                instructions={states.recipe?.instructions ?? []}
            />
        </>
    )
}
