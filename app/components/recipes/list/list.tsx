import { useEffect, useRef } from "react"
import { FlatList, RefreshControl, Text } from "react-native"
import { useHeaderHeight } from "@react-navigation/elements"
import { useRecipeList } from "@/hooks/recipes/useRecipeList"
import RecipeSectionHeader from "@/components/recipes/list/recipeSectionHeader"
import RecipeCard from "@/components/recipes/list/recipeCard"
import useThemes from "@/hooks/themes/useThemes"

export default function RecipesList() {
    const { vars, theme } = useThemes()
    const headerHeight = useHeaderHeight()

    const { actions, states } = useRecipeList()

    const flatListRef = useRef<FlatList>(null)

    useEffect(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
    }, [states.sections])

    const renderRecipe = ({ item }: any) => {
        if (!item) return null

        if (item.type === "section") {
            return <RecipeSectionHeader title={item.title} />
        }

        return (
            <RecipeCard
                recipe={item.recipe}
                favoriteRecipes={states.favoriteRecipes}
                deleteRecipe={actions.deleteRecipe}
                toggleFavorite={actions.toggleFavorite}
            />
        )
    }

    return (
        <FlatList
            ref={flatListRef}
            data={states.sections}
            keyExtractor={(item, index) =>
                item.type === "section" ? `section-${item.title}-${index}` : `recipe-${item.recipe.id}`
            }
            renderItem={renderRecipe}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingTop: headerHeight,
                paddingBottom: headerHeight + 60,
            }}
            refreshControl={
                <RefreshControl
                    refreshing={states.refreshing}
                    onRefresh={actions.refresh}
                    tintColor={theme === "light" ? "black" : "white"}
                    colors={[theme === "light" ? "black" : "white"]}
                    progressViewOffset={headerHeight}
                />
            }
            ListEmptyComponent={
                <Text
                    style={{
                        textAlign: "center",
                        marginTop: 40,
                        color: vars.textColor,
                        fontSize: 16,
                    }}
                >
                    No recipes found
                </Text>
            }
        />
    )
}
