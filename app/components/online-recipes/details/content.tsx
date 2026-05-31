import { Linking, ScrollView, Text, View } from "react-native"
import { OnlineRecipe } from "@/types/recipes"
import IngredientsList from "@/components/online-recipes/details/ingredientsList"
import Instructions from "@/components/online-recipes/details/instructions"
import NutritionList from "@/components/online-recipes/details/nutritionList"
import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    recipe: OnlineRecipe
    offset: number
    open: () => void
}

export default function RecipeContent({ recipe, offset, open }: Props) {
    const { vars } = useThemes()
    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: offset - 20, paddingHorizontal: 16 }}>
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

            {recipe.ingredients != null && recipe.ingredients.length > 0 && <IngredientsList recipe={recipe} />}
            {recipe.instructions && <Instructions recipe={recipe} open={open} />}
            {recipe.nutrition && recipe.nutrition.fat && <NutritionList nutrition={recipe.nutrition} />}
            <View style={{ height: 50 }} />
        </ScrollView>
    )
}
