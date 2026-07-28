import { useRef } from "react"
import { ActivityIndicator, FlatList, View } from "react-native"
import { useHeaderHeight } from "@react-navigation/elements"
import RecipeSectionHeader from "@/components/recipes/list/recipeSectionHeader"
import RecipeCard from "@/components/recipes/list/recipeCard"
import { RecipeSummary } from "@/types/generated/models/recipe_summary"

type Props = {
    favoriteRecipes: RecipeSummary[]
    toggleFavorite: (recipe: RecipeSummary) => void
    sections: any[]
    getNextPage: () => void
    refreshing: boolean
    refresh: () => void
    loading: boolean
}

export default function RecipesList({
    favoriteRecipes,
    toggleFavorite,
    sections,
    getNextPage,
    refreshing,
    refresh,
    loading,
}: Props) {
    const headerHeight = useHeaderHeight()

    const flatListRef = useRef<FlatList>(null)

    const renderRecipe = ({ item }: any) => {
        if (!item) return null

        if (item.type === "section") {
            return <RecipeSectionHeader title={item.title} />
        }

        return <RecipeCard recipe={item.recipe} favoriteRecipes={favoriteRecipes} toggleFavorite={toggleFavorite} />
    }

    return (
        <FlatList
            ref={flatListRef}
            data={sections}
            keyExtractor={(item, index) =>
                item.type === "section" ? `section-${item.title}-${index}` : `recipe-${item.recipe.id}`
            }
            ListHeaderComponent={<View style={{ height: headerHeight }} />}
            onEndReached={getNextPage}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={refresh}
            renderItem={renderRecipe}
            contentContainerStyle={{
                paddingBottom: 90,
            }}
            ListFooterComponent={loading ? <ActivityIndicator style={{ marginTop: 10 }} /> : null}
        />
    )
}
