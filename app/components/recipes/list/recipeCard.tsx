import { StyleSheet, Text, View } from "react-native"
import { Link } from "expo-router"
import { MEALS } from "@/lib/constants"
import * as Haptics from "expo-haptics"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { Recipe } from "@/types/recipes"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { Image } from "expo-image"

type Props = {
    recipe: Recipe
    favoriteRecipes: string[]
    deleteRecipe: (recipe: Recipe) => void
    toggleFavorite: (id: string) => void
}

export default function RecipeCard({ recipe, deleteRecipe, toggleFavorite }: Props) {
    const { vars } = useThemes()
    const { favoriteRecipes } = useRecipesStore()
    const { user } = useSettingsStore()

    const canEdit = recipe.user === user
    const isFavorite = favoriteRecipes.includes(recipe.id)

    return (
        <Link href={`/recipes/${recipe.id}`} key={recipe.id} style={{ marginBottom: 16 }}>
            <Link.Trigger>
                <View style={styles.recipeCard}>
                    <View style={styles.imageWrapper}>
                        {recipe.banner ? (
                            <Image
                                source={recipe.banner}
                                style={styles.recipeImage}
                                placeholder={recipe.banner.replace("large-", "small-")}
                                placeholderContentFit={"cover"}
                                contentFit={"cover"}
                                transition={250}
                            />
                        ) : (
                            <View
                                style={[
                                    styles.recipeImage,
                                    {
                                        backgroundColor: vars.secondaryBackgroundColor,
                                    },
                                ]}
                            />
                        )}

                        <View style={styles.overlay}>
                            <GlassOrBlurView
                                backgroundColor={vars.secondaryBackgroundColor}
                                blurBorderWidth={0}
                                style={styles.titleGlass}
                                forceBlur
                            >
                                <Text
                                    style={[styles.recipeTitle, { color: vars.textColor }]}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {recipe.title}
                                </Text>
                            </GlassOrBlurView>

                            <View style={styles.chipsRow}>
                                {recipe.mealType && recipe.mealType !== "Any" && (
                                    <GlassOrBlurView
                                        backgroundColor={vars.secondaryBackgroundColor}
                                        blurBorderWidth={0}
                                        style={styles.chipGlass}
                                        forceBlur
                                    >
                                        <Text style={[styles.chipText, { color: vars.textColor }]}>
                                            {MEALS[recipe.mealType]} {recipe.mealType}
                                        </Text>
                                    </GlassOrBlurView>
                                )}

                                {recipe.country && (
                                    <GlassOrBlurView
                                        backgroundColor={vars.secondaryBackgroundColor}
                                        blurBorderWidth={0}
                                        style={styles.chipGlass}
                                        forceBlur
                                    >
                                        <Text style={[styles.chipText, { color: vars.textColor }]}>
                                            {recipe.country}
                                        </Text>
                                    </GlassOrBlurView>
                                )}

                                {Number(recipe.time) > 0 && (
                                    <GlassOrBlurView
                                        backgroundColor={vars.secondaryBackgroundColor}
                                        blurBorderWidth={0}
                                        style={styles.chipGlass}
                                        forceBlur
                                    >
                                        <Text style={[styles.chipText, { color: vars.textColor }]}>
                                            ⏱ {recipe.time} min
                                        </Text>
                                    </GlassOrBlurView>
                                )}

                                {Number(recipe.persons) > 0 && (
                                    <GlassOrBlurView
                                        backgroundColor={vars.secondaryBackgroundColor}
                                        blurBorderWidth={0}
                                        style={styles.chipGlass}
                                        forceBlur
                                    >
                                        <Text style={[styles.chipText, { color: vars.textColor }]}>
                                            👥 {recipe.persons} Persons
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
                    onPress={async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        toggleFavorite(recipe.id)
                    }}
                />

                {canEdit ? (
                    <Link.MenuAction
                        title="Delete"
                        destructive
                        icon="trash"
                        onPress={async () => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            deleteRecipe(recipe)
                        }}
                    />
                ) : (
                    <></>
                )}
            </Link.Menu>

            <Link.Preview style={{ width: 300, height: 220 }}>
                <View style={styles.recipeCard}>
                    {recipe.banner ? (
                        <Image
                            source={recipe.banner}
                            style={styles.recipeImage}
                            placeholder={recipe.banner.replace("large-", "small-")}
                            placeholderContentFit={"contain"}
                            contentFit={"contain"}
                            transition={250}
                        />
                    ) : (
                        <View style={[styles.recipeImage, { backgroundColor: vars.secondaryBackgroundColor }]} />
                    )}
                </View>
            </Link.Preview>
        </Link>
    )
}

const styles = StyleSheet.create({
    recipeCard: {
        width: "100%",
        borderRadius: 28,
        overflow: "hidden",
        elevation: 4,
        backgroundColor: "transparent",
    },
    imageWrapper: {
        position: "relative",
    },
    recipeImage: {
        width: "100%",
        height: 170,
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 14,
        gap: 8,
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
    },
    chipGlass: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    chipText: {
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.2,
    },
    titleGlass: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        marginBottom: 6,
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
})
