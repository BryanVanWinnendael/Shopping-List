import { ActivityIndicator, StyleSheet, View } from "react-native"
import { useSharedValue } from "react-native-reanimated"
import Background from "@/components/online-recipes/details/background"
import Buttons from "@/components/online-recipes/details/buttons"
import RecipeContent from "@/components/online-recipes/details/content"
import useThemes from "@/hooks/themes/useThemes"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"

type Props = {
    recipe: OnlineRecipeDetails | null
    open: () => void
}

export default function DetailsScreen({ recipe, open }: Props) {
    const { vars } = useThemes()

    const scrollY = useSharedValue(0)

    return (
        <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
            {recipe ? (
                <>
                    <Background recipe={recipe} scrollY={scrollY} />
                    <RecipeContent recipe={recipe} open={open} scrollY={scrollY} />
                </>
            ) : (
                <ActivityIndicator style={styles.loader} color={vars.textColor} />
            )}

            <Buttons recipe={recipe} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loader: {
        marginTop: 50,
    },
})
