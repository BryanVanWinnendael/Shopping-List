import { ActivityIndicator, FlatList, View } from "react-native"
import Recipe from "@/components/online-recipes/recipe"
import { OnlineRecipe } from "@/types/recipes"
import { useHeaderHeight } from "@react-navigation/elements"

type Props = {
    results: OnlineRecipe[]
    onEndReached: () => void
    loading: boolean
    variant?: "list" | "grid"
}

export function List({ results, onEndReached, loading, variant = "list" }: Props) {
    const headerHeight = useHeaderHeight()

    const isGrid = variant === "grid"

    return (
        <FlatList
            ListFooterComponent={loading ? <ActivityIndicator style={{ marginTop: 10 }} /> : null}
            key={variant}
            data={results}
            keyExtractor={(item, index) => item.title + index}
            renderItem={({ item }) => (
                <View style={{ flex: 1 }}>
                    <Recipe recipe={item} variant={variant} />
                </View>
            )}
            numColumns={isGrid ? 2 : 1}
            columnWrapperStyle={isGrid ? { gap: 12, paddingHorizontal: 12 } : undefined}
            contentContainerStyle={{
                paddingBottom: 50,
            }}
            ListHeaderComponent={<View style={{ height: headerHeight }} />}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
        />
    )
}
