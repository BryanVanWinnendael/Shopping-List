import { useRef } from "react"
import { ActivityIndicator, FlatList, View } from "react-native"
import { useHeaderHeight } from "@react-navigation/elements"
import { useRecipeList } from "@/hooks/recipes/useRecipeList"
import RecipeSectionHeader from "@/components/recipes/list/recipeSectionHeader"
import RecipeCard from "@/components/recipes/list/recipeCard"

export default function RecipesList() {
    const headerHeight = useHeaderHeight()

    const { actions, states } = useRecipeList()

    const flatListRef = useRef<FlatList>(null)

    const renderRecipe = ({ item }: any) => {
        if (!item) return null

        if (item.type === "section") {
            return <RecipeSectionHeader title={item.title} />
        }

        return (
            <RecipeCard
                recipe={item.recipe}
                favoriteRecipes={states.favoriteRecipes}
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
            ListHeaderComponent={<View style={{ height: headerHeight }} />}
            onEndReached={actions.getNextPage}
            onEndReachedThreshold={0.5}
            refreshing={states.refreshing}
            onRefresh={actions.refresh}
            renderItem={renderRecipe}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingBottom: 90,
            }}
            ListFooterComponent={states.loading ? <ActivityIndicator style={{ marginTop: 10 }} /> : null}
        />
    )
}
