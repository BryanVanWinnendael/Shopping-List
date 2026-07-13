import { ActivityIndicator, FlatList, View } from "react-native"
import Product from "@/components/products-search/product"
import { useHeaderHeight } from "@react-navigation/elements"
import { ProductsSearchResponse } from "@/types/generated/contracts/products-search"

type Props = {
    results: ProductsSearchResponse
    loading: boolean
    onEndReached: () => void
}

export function List({ results, loading, onEndReached }: Props) {
    const headerHeight = useHeaderHeight()

    return (
        <FlatList
            showsVerticalScrollIndicator={false}
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
