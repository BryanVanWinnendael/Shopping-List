import useOnlineRecipeDetails from "@/hooks/recipes/useOnlineRecipeDetails"
import DetailsScreen from "@/components/online-recipes/details/detailsScreen"
import InstructionsBottomSheet from "@/components/online-recipes/details/instructionsBottomSheet"

export default function OnlineRecipeDetails() {
    const { actions, states, refs } = useOnlineRecipeDetails()

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
