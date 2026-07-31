import { ActivityIndicator, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import { useHeaderHeight } from "@react-navigation/elements"
import Background from "@/components/online-recipes/details/background"
import RecipeContent from "@/components/online-recipes/details/content"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"
import { useSharedValue } from "react-native-reanimated"
import Buttons from "@/components/online-recipes/details/buttons"

type Props = {
    recipe: OnlineRecipeDetails | null
    open: () => void
}

export default function DetailsScreen({ recipe, open }: Props) {
    const { vars } = useThemes()
    const headerHeight = useHeaderHeight()

    const scrollY = useSharedValue(0)

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: vars.backgroundColor,
            }}
        >
            <Buttons recipe={recipe} />

            {recipe ? (
                <View style={{ flex: 1 }}>
                    <Background recipe={recipe} scrollY={scrollY} />

                    <RecipeContent recipe={recipe} open={open} scrollY={scrollY} />
                </View>
            ) : (
                <ActivityIndicator style={{ marginTop: 50 }} color={vars.textColor} />
            )}
        </View>
    )
}
