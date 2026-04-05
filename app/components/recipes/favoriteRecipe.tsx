import { Star, StarOff } from "lucide-react-native"
import { useSettings } from "@/stores/useSettings"
import { getTextColor } from "@/lib/theme"
import { PressableScale } from "pressto"
import { GlassOrBlurView } from "../glassOrBlurView"
import { Recipe } from "@/types"
import { useRecipes } from "@/stores/useRecipes"

type Props = {
  recipe: Recipe
}

export function FavoriteRecipe({ recipe }: Props) {
  const { theme } = useSettings()
  const { setFavoriteRecipes, favoriteRecipes } = useRecipes()
  const isFavorite = favoriteRecipes.includes(recipe.id)

  const textColor = getTextColor(theme)

  const handleAddToFavorites = async () => {
    if (isFavorite) {
      setFavoriteRecipes(favoriteRecipes.filter((r) => r !== recipe.id))
    } else {
      setFavoriteRecipes([...favoriteRecipes, recipe.id])
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
        {isFavorite ? (
          <StarOff size={20} color={textColor} />
        ) : (
          <Star size={20} color={textColor} />
        )}
      </GlassOrBlurView>
    </PressableScale>
  )
}
