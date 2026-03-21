import { View, Text, Image, StyleSheet } from "react-native"
import { Link } from "expo-router"
import { MEALS } from "@/lib/constants"
import * as Haptics from "expo-haptics"
import { ImageLoader } from "../imageLoader"
import { Recipe } from "@/types"
import { useSettings } from "@/stores/useSettings"
import { getSecondaryBackgroundColor, getTextColor } from "@/lib/theme"
import { GlassOrBlurView } from "../glassOrBlurView"
import { useRecipes } from "@/stores/useRecipes"

type Props = {
  item: Recipe
  favoriteRecipes: string[]
  onDelete: (item: Recipe) => void
  onToggleFavorite: (id: string) => void
}

export default function RecipeCard({
  item,
  onDelete,
  onToggleFavorite,
}: Props) {
  const { favoriteRecipes } = useRecipes()
  const { user, theme } = useSettings()

  const textColor = getTextColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)

  const canEdit = item.createdBy === user
  const isFavorite = favoriteRecipes.includes(item.id)

  return (
    <Link
      href={`/recipes/${item.id}`}
      key={item.id}
      style={{ marginBottom: 16 }}
    >
      <Link.Trigger>
        <View style={styles.recipeCard}>
          <View style={styles.imageWrapper}>
            {item.image ? (
              <ImageLoader
                large={item.image}
                small={item.image.replace("large-", "small-")}
                style={styles.recipeImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.recipeImage,
                  {
                    backgroundColor: secondaryBackgroundColor,
                  },
                ]}
              />
            )}

            <View style={styles.overlay}>
              <GlassOrBlurView style={styles.titleGlass} forceBlur>
                <Text
                  style={[styles.recipeTitle, { color: textColor }]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
              </GlassOrBlurView>

              <View style={styles.chipsRow}>
                {item.mealType && item.mealType !== "Any" && (
                  <GlassOrBlurView style={styles.chipGlass} forceBlur>
                    <Text style={[styles.chipText, { color: textColor }]}>
                      {MEALS[item.mealType]} {item.mealType}
                    </Text>
                  </GlassOrBlurView>
                )}

                {item.country && (
                  <GlassOrBlurView style={styles.chipGlass} forceBlur>
                    <Text style={[styles.chipText, { color: textColor }]}>
                      {item.country}
                    </Text>
                  </GlassOrBlurView>
                )}

                {Number(item.time) > 0 && (
                  <GlassOrBlurView style={styles.chipGlass} forceBlur>
                    <Text style={[styles.chipText, { color: textColor }]}>
                      ⏱ {item.time} min
                    </Text>
                  </GlassOrBlurView>
                )}
              </View>
            </View>
          </View>
        </View>
      </Link.Trigger>

      <Link.Menu>
        <Link.MenuAction
          title={isFavorite ? "Unfavorite" : "Favorite"}
          icon="star"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            onToggleFavorite(item.id)
          }}
        />

        {canEdit ? (
          <Link.MenuAction
            title="Delete"
            destructive
            icon="trash"
            onPress={() => onDelete(item)}
          />
        ) : (
          <></>
        )}
      </Link.Menu>

      <Link.Preview style={{ width: 300, height: 220 }}>
        <View style={styles.recipeCard}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.recipeImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.recipeImage,
                { backgroundColor: secondaryBackgroundColor },
              ]}
            />
          )}
        </View>
      </Link.Preview>
    </Link>
  )
}

const styles = StyleSheet.create({
  recipeCard: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 5,
  },
  imageWrapper: {
    position: "relative",
  },
  recipeImage: {
    width: "100%",
    height: 160,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  left: {
    flex: 1,
    paddingRight: 8,
  },
  right: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  chipGlass: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  titleGlass: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
})
