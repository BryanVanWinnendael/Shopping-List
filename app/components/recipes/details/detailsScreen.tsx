import { StyleSheet, View } from "react-native"
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
import Skeleton from "@/components/native/skeleton"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

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
                <DetailsSkeleton />
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

function DetailsSkeleton() {
    return (
        <View style={styles.content}>
            <Skeleton style={styles.skeletonBanner} />

            <View style={styles.skeletonBody}>
                <Skeleton delay={60} style={styles.skeletonTitle} />

                <View style={styles.skeletonMetaRow}>
                    <Skeleton delay={120} style={styles.skeletonMeta} />
                    <Skeleton delay={180} style={styles.skeletonMeta} />
                </View>

                <Skeleton delay={240} style={styles.skeletonLine} />
                <Skeleton delay={300} style={styles.skeletonLineShort} />
            </View>
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
    skeletonBanner: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 240,
    },
    skeletonBody: {
        paddingTop: 240,
        paddingHorizontal: 20,
        paddingBottom: 80,
    },
    skeletonTitle: {
        height: 36,
        width: "70%",
        borderRadius: BORDER_RADIUS_M,
        marginTop: 8,
        marginBottom: 14,
    },
    skeletonMetaRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 14,
    },
    skeletonMeta: {
        height: 28,
        width: 90,
        borderRadius: BORDER_RADIUS_M,
    },
    skeletonLine: {
        height: 16,
        width: "100%",
        borderRadius: BORDER_RADIUS_M,
        marginBottom: 10,
    },
    skeletonLineShort: {
        height: 16,
        width: "60%",
        borderRadius: BORDER_RADIUS_L,
    },
})
