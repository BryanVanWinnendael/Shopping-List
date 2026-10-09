import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native"
import Product from "@/components/products-search/product"
import { ProductsSearchResponse } from "@/types/generated/contracts/products-search"
import { HEADER_HEIGHT } from "@/lib/constants"

type Props = {
    results: ProductsSearchResponse
    loading: boolean
    getNextPage: () => void
}

export function List({ results, loading, getNextPage }: Props) {
    return (
        <FlatList
            data={results.products}
            keyExtractor={(product, index) => product.name + index}
            renderItem={({ item }) => <Product product={item} />}
            onEndReached={getNextPage}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading ? <ActivityIndicator style={styles.footerLoader} /> : null}
            ListHeaderComponent={<View style={styles.header} />}
            contentContainerStyle={styles.content}
        />
    )
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 90,
    },
    header: {
        height: HEADER_HEIGHT,
    },
    footerLoader: {
        marginTop: 10,
    },
})
