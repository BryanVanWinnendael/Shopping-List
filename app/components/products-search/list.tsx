import { ActivityIndicator, FlatList, View } from "react-native"
import Product from "@/components/products-search/product"
import { ProductsSearchResponse } from "@/types/products-search"
import { useHeaderHeight } from "@react-navigation/elements"

type Props = {
    results: ProductsSearchResponse
    loading: boolean
    onEndReached: () => void
}

export function List({ results, loading, onEndReached }: Props) {
    const headerHeight = useHeaderHeight()

    return (
        <FlatList
            data={results.products}
            keyExtractor={(product, index) => product.name + index}
            renderItem={({ item }) => <Product product={item} />}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading ? <ActivityIndicator style={{ marginTop: 10 }} /> : null}
            ListHeaderComponent={<View style={{ height: headerHeight }} />}
            contentContainerStyle={{
                paddingBottom: 90,
            }}
        />
    )
}
