import { StyleSheet, View } from "react-native"
import { useSettings } from "@/stores/useSettings"
import { getSecondaryBackgroundColor } from "@/lib/theme"
import { Recipe } from "@/types"
import { ImageLoader } from "../imageLoader"
import { RecipesBack } from "./recipesBack"
import { FavoriteRecipe } from "./favoriteRecipe"
import { EditRecipeButton } from "./editRecipeButton"

type Props = {
  recipe: Recipe
  children?: React.ReactNode
  openSheet?: () => void
}

export function RecipesBackground({ recipe, children, openSheet }: Props) {
  const { theme, user } = useSettings()

  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)

  const canEdit = recipe?.createdBy === user

  return (
    <View style={styles.container}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: secondaryBackgroundColor },
        ]}
        pointerEvents="none"
      />

      {recipe.image && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ImageLoader
            small={recipe.image.replace("large", "small")}
            large={recipe.image}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.backButtonContainer}>
        <RecipesBack />
      </View>

      <View
        style={[styles.favoriteButtonContainer, { right: canEdit ? 70 : 16 }]}
      >
        <FavoriteRecipe recipe={recipe} />
      </View>

      {canEdit && (
        <View style={styles.favoriteButtonContainer}>
          <EditRecipeButton openSheet={openSheet} />
        </View>
      )}

      {children && <View style={styles.floatingContent}>{children}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 160,
  },
  backButtonContainer: {
    position: "absolute",
    left: 10,
    top: 15,
    zIndex: 10,
  },
  favoriteButtonContainer: {
    position: "absolute",
    top: 15,
    zIndex: 10,
    right: 16,
  },
  floatingContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: -40,
    zIndex: 10,
  },
})
