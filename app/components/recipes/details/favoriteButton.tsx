import { Star, StarOff } from "lucide-react-native"
import { PressableScale } from "pressto"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { Recipe } from "@/types/recipes"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    recipe: Recipe
}

export default function FavoriteButton({ recipe }: Props) {
    const { vars } = useThemes()
    const { setFavoriteRecipes, favoriteRecipes } = useRecipesStore()
    const isFavorite = favoriteRecipes.includes(recipe.id)

    const handleAddToFavorites = async () => {
        if (isFavorite) {
            await setFavoriteRecipes(favoriteRecipes.filter((r) => r !== recipe.id))
        } else {
            await setFavoriteRecipes([...favoriteRecipes, recipe.id])
        }
    }

    return (
        <PressableScale
            onPress={handleAddToFavorites}
            style={{
                justifyContent: "center",
                alignItems: "center",
                width: 40,
                height: 40,
            }}
        >
            <GlassOrBlurView
                borderColor={`${vars.secondaryBorderColor}50`}
                style={[
                    {
                        borderRadius: 50,
                        overflow: "hidden",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 8,
                        width: 40,
                        height: 40,
                    },
                ]}
            >
                {isFavorite ? <StarOff size={20} color={vars.textColor} /> : <Star size={20} color={vars.textColor} />}
            </GlassOrBlurView>
        </PressableScale>
    )
}
