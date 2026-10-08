import { useCallback } from "react"
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native"
import Recipe from "@/components/online-recipes/recipe"
import { HEADER_HEIGHT } from "@/lib/constants"
import { OnlineRecipe } from "@/types/generated/models/online_recipe"

type Props = {
    results: OnlineRecipe[]
    onEndReached: () => void
    loading: boolean
    variant?: "list" | "grid"
}

const keyExtractor = (item: OnlineRecipe, index: number) => `${item.title}-${index}`

export function List({ results, onEndReached, loading, variant = "list" }: Props) {
    const isGrid = variant === "grid"

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
            contentContainerStyle={styles.content}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading ? <ActivityIndicator style={styles.loader} /> : null}
        />
    )
}

const styles = StyleSheet.create({
    content: {
        paddingTop: HEADER_HEIGHT,
        paddingBottom: HEADER_HEIGHT + 60,
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
