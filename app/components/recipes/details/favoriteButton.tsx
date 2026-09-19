import { Star, StarOff } from "lucide-react-native"
import { PressableScale } from "pressto"
import { GlassView } from "expo-glass-effect"

import { useRecipesStore } from "@/stores/useRecipesStore"
import useThemes from "@/hooks/themes/useThemes"
import { Recipe } from "@/types/generated/models/recipe"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    recipe: Recipe
}

export default function FavoriteButton({ recipe }: Props) {
    const { vars, theme } = useThemes()
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
            style={{
                justifyContent: "center",
                alignItems: "center",
                width: 48,
                height: 48,
            }}
        >
            <GlassView
                glassEffectStyle="regular"
                isInteractive
                colorScheme={theme === "light" ? "light" : "dark"}
                tintColor={vars.secondaryBackgroundColor}
                style={{
                    borderRadius: BORDER_RADIUS_FULL,
                    overflow: "hidden",
                    justifyContent: "center",
                    alignItems: "center",
                    width: 48,
                    height: 48,
                }}
            >
                {isFavorite ? <StarOff size={20} color={vars.textColor} /> : <Star size={20} color={vars.textColor} />}
            </GlassView>
        </PressableScale>
    )
}
