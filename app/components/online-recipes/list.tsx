import { useCallback } from "react"
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native"
import Recipe from "@/components/online-recipes/recipe"
import { RecipeCardSkeleton } from "@/components/native/skeleton"
import { HEADER_HEIGHT } from "@/lib/constants"
import { OnlineRecipe } from "@/types/generated/models/online_recipe"

type Props = {
    results: OnlineRecipe[]
    onEndReached: () => void
    loading: boolean
    variant?: "list" | "grid"
}

// Keyed by url so pinning a recipe (which reorders the list) reuses the same rows.
const keyExtractor = (item: OnlineRecipe) => item.url

export function List({ results, onEndReached, loading, variant = "list" }: Props) {
    const isGrid = variant === "grid"
    const isInitialLoading = loading && results.length === 0

    const renderItem = useCallback(
        ({ item }: { item: OnlineRecipe }) => (
            <View style={styles.cell}>
                <Recipe recipe={item} variant={variant} />
            </View>
        ),
        [variant]
    )

    return (
        <FlatList
            key={variant}
            data={results}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            numColumns={isGrid ? 2 : 1}
            columnWrapperStyle={isGrid ? styles.gridRow : undefined}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={isInitialLoading ? <InitialSkeleton /> : null}
            ListFooterComponent={loading && !isInitialLoading ? <ActivityIndicator style={styles.loader} /> : null}
        />
    )
}

function InitialSkeleton() {
    return (
        <View>
            {[0, 1, 2, 3].map((index) => (
                <RecipeCardSkeleton key={index} index={index} />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    content: {
        paddingTop: HEADER_HEIGHT,
        paddingBottom: HEADER_HEIGHT + 85,
    },
    gridRow: {
        gap: 12,
        paddingHorizontal: 12,
    },
    cell: {
        flex: 1,
    },
    loader: {
        marginTop: 10,
    },
})
