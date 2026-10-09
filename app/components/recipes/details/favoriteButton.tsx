import { Star, StarOff } from "lucide-react-native"
import { PressableScale } from "pressto"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { StyleSheet } from "react-native"
import { useRecipesStore } from "@/stores/useRecipesStore"
import useThemes from "@/hooks/themes/useThemes"
import { Recipe } from "@/types/generated/models/recipe"
import { BORDER_RADIUS_FULL, FAB_ICON_SIZE, FAB_SIZE } from "@/lib/theme"

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
        <PressableScale onPress={handleAddToFavorites} style={styles.button}>
            <LiquidGlassView style={styles.glass} isInteractive>
                {isFavorite ? (
                    <StarOff size={FAB_ICON_SIZE} color={vars.textColor} />
                ) : (
                    <Star size={FAB_ICON_SIZE} color={vars.textColor} />
                )}
            </LiquidGlassView>
        </PressableScale>
    )
}

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
        width: FAB_SIZE,
        height: FAB_SIZE,
    },
    glass: {
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        width: FAB_SIZE,
        height: FAB_SIZE,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
})
