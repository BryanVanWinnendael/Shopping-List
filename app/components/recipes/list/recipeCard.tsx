import { StyleSheet, Text, View } from "react-native"
import { Link } from "expo-router"
import { MEALS } from "@/lib/constants"
import * as Haptics from "expo-haptics"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { useRecipesStore } from "@/stores/useRecipesStore"
import useThemes from "@/hooks/themes/useThemes"
import { Image } from "expo-image"
import { GlassView } from "expo-glass-effect"
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
    const { vars, appearance } = useThemes()
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
                            <GlassView
                                colorScheme={appearance}
                                glassEffectStyle="regular"
                                isInteractive
                                style={styles.titleGlass}
                            >
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
                            </GlassView>

                            <View style={styles.chipsRow}>
                                {recipe.mealType && recipe.mealType !== "Any" && (
                                    <GlassView
                                        colorScheme={appearance}
                                        glassEffectStyle="regular"
                                        isInteractive
                                        style={styles.chipGlass}
                                    >
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
                                    </GlassView>
                                )}

                                {recipe.country && (
                                    <GlassView
                                        colorScheme={appearance}
                                        glassEffectStyle="regular"
                                        isInteractive
                                        style={styles.chipGlass}
                                    >
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
                                    </GlassView>
                                )}

                                {Number(recipe.time) > 0 && (
                                    <GlassView
                                        colorScheme={appearance}
                                        glassEffectStyle="regular"
                                        isInteractive
                                        style={styles.chipGlass}
                                    >
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
                                    </GlassView>
                                )}

                                {Number(recipe.persons) > 0 && (
                                    <GlassView
                                        colorScheme={appearance}
                                        glassEffectStyle="regular"
                                        isInteractive
                                        style={styles.chipGlass}
                                    >
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
                                    </GlassView>
                                )}
                            </View>
                        </View>

                        <View pointerEvents="box-none" style={styles.savedIndicators}>
                            {recipe.isSaved && (
                                <GlassView
                                    isInteractive
                                    colorScheme={appearance}
                                    glassEffectStyle="regular"
                                    style={styles.savedGlass}
                                >
                                    <Globe size={18} strokeWidth={2.2} color={vars.textColor} />
                                </GlassView>
                            )}

                            {!recipe.public && (
                                <GlassView
                                    isInteractive
                                    colorScheme={appearance}
                                    glassEffectStyle="regular"
                                    style={styles.savedGlass}
                                >
                                    <EyeOff size={18} strokeWidth={2.2} color={vars.textColor} />
                                </GlassView>
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

            <Link.Preview
                style={{
                    width: 300,
                    height: 220,
                }}
            >
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
})
