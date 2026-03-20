import { StyleSheet, View } from "react-native"
import { useSettings } from "@/stores/useSettings"
import { getSecondaryBackgroundColor } from "@/lib/theme"
import { Recipe } from "@/types"
import { ImageLoader } from "../imageLoader"
import { RecipesBack } from "./recipesBack"

type Props = {
  recipe: Recipe
  children?: React.ReactNode
}

export function RecipesBackground({ recipe, children }: Props) {
  const { theme } = useSettings()

  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)

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
  floatingContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: -40,
    zIndex: 10,
  },
})
