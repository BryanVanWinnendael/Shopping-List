import { Linking, ScrollView, Text, View } from "react-native"
import { PressableScale } from "pressto"
import IngredientsList from "@/components/recipes/details/ingredientsList"
import { Recipe } from "@/types/recipes"
import useThemes from "@/hooks/themes/useThemes"
import Instructions from "@/components/recipes/details/instructions"

type Props = {
    recipe: Recipe
    offset: number
    open: () => void
}

export default function RecipeContent({ recipe, offset, open }: Props) {
    const { vars } = useThemes()

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: offset - 20, paddingHorizontal: 16 }}>
            {recipe.source && (
                <PressableScale
                    onPress={async () => {
                        if (recipe.source) await Linking.openURL(recipe.source)
                    }}
                    style={{
                        backgroundColor: `${vars.accentColor}33`,
                        padding: 12,
                        borderRadius: 20,
                        marginBottom: 16,
                    }}
                >
                    <Text style={{ color: vars.accentColor }}>View full recipe ↗</Text>
                </PressableScale>
            )}

            {recipe.ingredients != null && recipe.ingredients.length > 0 && <IngredientsList recipe={recipe} />}

            {recipe.instructions && <Instructions recipe={recipe} open={open} />}

            <View style={{ height: 50 }} />
        </ScrollView>
    )
}
