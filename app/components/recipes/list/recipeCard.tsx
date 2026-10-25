import { StyleSheet, Text, View } from "react-native"
import { Link } from "expo-router"
import { MEALS } from "@/lib/constants"
import * as Haptics from "expo-haptics"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { useRecipesStore } from "@/stores/useRecipesStore"
import useThemes from "@/hooks/themes/useThemes"
import { Image } from "expo-image"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { EyeOff, Globe } from "lucide-react-native"
import { Recipe } from "@/types/generated/models/recipe"
import { RecipeSummary } from "@/types/generated/models/recipe_summary"
import useDeleteRecipe from "@/hooks/recipes/useDeleteRecipe"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"

type Props = {
    recipe: Recipe
    toggleFavorite: (recipe: RecipeSummary) => void
}

export default function RecipeCard({ recipe, toggleFavorite }: Props) {
    const { actions } = useDeleteRecipe()
    const { vars } = useThemes()
    const { favoriteRecipes } = useRecipesStore()
    const { user } = useSettingsStore()

    const canEdit = recipe.user === user

    const isFavorite = favoriteRecipes.some((favoriteRecipe) => favoriteRecipe.id === recipe.id)

    const deleteRecipe = async () => {
        await actions.deleteRecipe(recipe.id)
    }

    return (
        <Link
            href={{
                pathname: `/recipes/${recipe.id}`,
                params: {
                    title: recipe.title,
                },
            }}
            key={recipe.id}
            style={styles.link}
        >
            <Link.Trigger>
                <View style={styles.recipeCard}>
                    <View style={styles.imageWrapper}>
                        {recipe.banner ? (
                            <Image
                                source={recipe.banner}
                                style={styles.recipeImage}
                                placeholder={recipe.banner.replace("large-", "small-")}
                                placeholderContentFit="cover"
                                contentFit="cover"
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

                        <View pointerEvents="box-none" style={styles.overlay}>
                            <LiquidGlassView style={styles.titleGlass} isInteractive>
                                <Text
                                    style={[
                                        styles.recipeTitle,
                                        {
                                            color: vars.textColor,
                                        },
                                    ]}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {recipe.title}
                                </Text>
                            </LiquidGlassView>

                            <View style={styles.chipsRow}>
                                {recipe.mealType && recipe.mealType !== "Any" && (
                                    <LiquidGlassView style={styles.chipGlass} isInteractive>
                                        <Text
                                            style={[
                                                styles.chipText,
                                                {
                                                    color: vars.textColor,
                                                },
                                            ]}
                                        >
                                            {MEALS[recipe.mealType]} {recipe.mealType}
                                        </Text>
                                    </LiquidGlassView>
                                )}

                                {recipe.country && (
                                    <LiquidGlassView style={styles.chipGlass} isInteractive>
                                        <Text
                                            style={[
                                                styles.chipText,
                                                {
                                                    color: vars.textColor,
                                                },
                                            ]}
                                        >
                                            {recipe.country}
                                        </Text>
                                    </LiquidGlassView>
                                )}

                                {Number(recipe.time) > 0 && (
                                    <LiquidGlassView style={styles.chipGlass} isInteractive>
                                        <Text
                                            style={[
                                                styles.chipText,
                                                {
                                                    color: vars.textColor,
                                                },
                                            ]}
                                        >
                                            ⏱ {recipe.time} min
                                        </Text>
                                    </LiquidGlassView>
                                )}

                                {Number(recipe.persons) > 0 && (
                                    <LiquidGlassView style={styles.chipGlass} isInteractive>
                                        <Text
                                            style={[
                                                styles.chipText,
                                                {
                                                    color: vars.textColor,
                                                },
                                            ]}
                                        >
                                            👥 {recipe.persons} Persons
                                        </Text>
                                    </LiquidGlassView>
                                )}
                            </View>
                        </View>

                        <View pointerEvents="box-none" style={styles.savedIndicators}>
                            {recipe.isSaved && (
                                <LiquidGlassView style={styles.savedGlass} isInteractive>
                                    <Globe size={18} strokeWidth={2.2} color={vars.textColor} />
                                </LiquidGlassView>
                            )}

                            {!recipe.public && (
                                <LiquidGlassView style={styles.savedGlass} isInteractive>
                                    <EyeOff size={18} strokeWidth={2.2} color={vars.textColor} />
                                </LiquidGlassView>
                            )}
                        </View>
                    </View>
                </View>
            </Link.Trigger>

            <Link.Menu>
                <Link.MenuAction
                    title={isFavorite ? "Unfavorite" : "Favorite"}
                    icon={isFavorite ? "star.slash" : "star"}
                    onPress={async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

                        toggleFavorite(recipe)
                    }}
                />

                {recipe.isSaved && (
                    <Link.MenuAction
                        title="Saved from online recipes"
                        icon="globe"
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        }}
                    />
                )}

                {!recipe.public && (
                    <Link.MenuAction
                        title="Private recipe"
                        icon="eye.slash"
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        }}
                    />
                )}

                {canEdit && (
                    <Link.MenuAction
                        title="Delete"
                        destructive
                        icon="trash"
                        onPress={async () => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

                            await deleteRecipe()
                        }}
                    />
                )}
            </Link.Menu>

            <Link.Preview style={styles.preview}>
                <View style={styles.previewCard}>
                    {recipe.banner ? (
                        <Image
                            source={recipe.banner}
                            style={styles.previewImage}
                            placeholder={recipe.banner.replace("large-", "small-")}
                            placeholderContentFit="cover"
                            contentFit="cover"
                            transition={250}
                        />
                    ) : (
                        <View
                            style={[
                                styles.previewImage,
                                {
                                    backgroundColor: vars.secondaryBackgroundColor,
                                },
                            ]}
                        />
                    )}
                </View>
            </Link.Preview>
        </Link>
    )
}

const styles = StyleSheet.create({
    link: {
        marginBottom: 16,
    },
    recipeCard: {
        width: "100%",
        borderRadius: BORDER_RADIUS_L,
        overflow: "hidden",
        backgroundColor: "transparent",
    },
    imageWrapper: {
        position: "relative",
        overflow: "hidden",
        borderRadius: BORDER_RADIUS_L,
    },
    recipeImage: {
        width: "100%",
        height: 190,
    },
    overlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: 14,
        gap: 8,
    },
    titleGlass: {
        alignSelf: "flex-start",
        maxWidth: "90%",
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS_L,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    recipeTitle: {
        fontSize: 17,
        lineHeight: 21,
        fontWeight: "700",
        letterSpacing: -0.2,
    },
    chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 7,
        alignItems: "center",
    },
    chipGlass: {
        alignSelf: "flex-start",
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    chipText: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "600",
        letterSpacing: 0.1,
    },
    savedIndicators: {
        position: "absolute",
        top: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    savedGlass: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS_FULL,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    previewCard: {
        width: "100%",
        height: "100%",
        borderRadius: BORDER_RADIUS_L,
        overflow: "hidden",
    },
    previewImage: {
        width: "100%",
        height: "100%",
    },
    preview: {
        width: 300,
        height: 220,
    },
})
