import { Star, StarOff } from "lucide-react-native"
import { PressableScale } from "pressto"
import { useRecipesStore } from "@/stores/useRecipesStore"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { Recipe } from "@/types/generated/models/recipe"
import { SHADOW_STYLE_LIGHT } from "@/lib/constants"

type Props = {
    recipe: Recipe
}

export default function FavoriteButton({ recipe }: Props) {
    const { vars } = useThemes()
    const { setFavoriteRecipes, favoriteRecipes } = useRecipesStore()
    const isFavorite = favoriteRecipes.some((favoriteRecipe) => favoriteRecipe.id === recipe.id)

    const handleAddToFavorites = async () => {
        if (isFavorite) {
            await setFavoriteRecipes(favoriteRecipes.filter((r) => r.id !== recipe.id))
        } else {
            await setFavoriteRecipes([...favoriteRecipes, recipe])
        }
    }

    return (
        <PressableScale
            onPress={handleAddToFavorites}
            style={[
                {
                    justifyContent: "center",
                    alignItems: "center",
                    width: 48,
                    height: 48,
                },
                SHADOW_STYLE_LIGHT,
            ]}
        >
            <GlassOrBlurView
                borderColor={`${vars.secondaryBorderColor}50`}
                style={[
                    {
                        borderRadius: 50,
                        overflow: "hidden",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 48,
                        height: 48,
                    },
                ]}
            >
                {isFavorite ? <StarOff size={20} color={vars.textColor} /> : <Star size={20} color={vars.textColor} />}
            </GlassOrBlurView>
        </PressableScale>
    )
}
