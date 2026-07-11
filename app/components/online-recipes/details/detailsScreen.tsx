import { ActivityIndicator, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import { useHeaderHeight } from "@react-navigation/elements"
import Background from "@/components/online-recipes/details/background"
import Header from "@/components/online-recipes/details/header"
import { useState } from "react"
import RecipeContent from "@/components/online-recipes/details/content"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"

type Props = {
    recipe: OnlineRecipeDetails | null
    open: () => void
}

export default function DetailsScreen({ recipe, open }: Props) {
    const { vars } = useThemes()
    const headerHeight = useHeaderHeight()

    const [offset, setOffset] = useState(0)

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: vars.backgroundColor,
                paddingTop: headerHeight - 40,
            }}
        >
            <Background recipe={recipe} />
            {recipe ? (
                <>
                    <Header headerHeight={headerHeight} recipe={recipe} setOffset={setOffset} />
                    <RecipeContent recipe={recipe} offset={offset} open={open} />
                </>
            ) : (
                <ActivityIndicator style={{ marginTop: 50 }} color={vars.textColor} />
            )}
        </View>
    )
}
