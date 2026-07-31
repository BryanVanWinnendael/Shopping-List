import { Linking, StyleSheet, Text, View } from "react-native"
import Animated, { SharedValue, useAnimatedScrollHandler } from "react-native-reanimated"
import useThemes from "@/hooks/themes/useThemes"
import { PressableScale } from "pressto"
import { ChevronRight } from "lucide-react-native"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"
import IngredientsList from "@/components/online-recipes/details/ingredientsList"
import Instructions from "@/components/online-recipes/details/instructions"

type Props = {
    recipe: OnlineRecipeDetails
    open: () => void
    scrollY: SharedValue<number>
}

export default function RecipeContent({ recipe, open, scrollY }: Props) {
    const { vars } = useThemes()

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y
        },
    })

    return (
        <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                <Text
                    style={[
                        styles.title,
                        {
                            color: vars.textColor,
                        },
                    ]}
                >
                    {recipe.title}
                </Text>

                <View>
                    {recipe.ingredients && recipe.ingredients.length > 0 && <IngredientsList recipe={recipe} />}
                </View>

                <View>{recipe.instructions && <Instructions recipe={recipe} open={open} />}</View>

                {recipe.source && (
                    <PressableScale onPress={() => Linking.openURL(recipe.source!)} style={[styles.source]}>
                        <Text
                            style={[
                                styles.sourceText,
                                {
                                    color: vars.accentColor,
                                },
                            ]}
                        >
                            View original recipe
                        </Text>
                        <ChevronRight color={vars.accentColor} />
                    </PressableScale>
                )}
            </View>
        </Animated.ScrollView>
    )
}

function Meta({ text, accent }: { text: string; accent: string }) {
    return (
        <View
            style={[
                styles.meta,
                {
                    backgroundColor: `${accent}20`,
                },
            ]}
        >
            <Text
                style={[
                    styles.metaText,
                    {
                        color: accent,
                    },
                ]}
            >
                {text}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    content: {
        paddingTop: 240,
        paddingHorizontal: 20,
        paddingBottom: 80,
    },
    title: {
        fontSize: 32,
        lineHeight: 40,
        fontWeight: "800",
        letterSpacing: -1.5,
        marginBottom: 14,
        paddingTop: 8,
    },
    info: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 14,
    },
    meta: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 14,
    },
    metaText: {
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: -0.1,
    },
    source: {
        paddingVertical: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sourceText: {
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: -0.2,
    },
})
