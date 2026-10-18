import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native"
import Product from "@/components/products-search/product"
import ListRefreshControl from "@/components/native/listRefreshControl"
import { ProductRowSkeleton } from "@/components/native/skeleton"
import { ProductsSearchResponse } from "@/types/generated/contracts/products-search"
import { HEADER_HEIGHT } from "@/lib/constants"

type Props = {
    results: ProductsSearchResponse
    loading: boolean
    refreshing: boolean
    getNextPage: () => void
    onRefresh: () => void
}

const SKELETON_ROWS = Array.from({ length: 7 }, (_, index) => index)

function SkeletonRows() {
    return (
        <>
            {SKELETON_ROWS.map((index) => (
                <ProductRowSkeleton key={`skeleton-${index}`} index={index} />
            ))}
        </>
    )
}

export function List({ results, loading, refreshing, getNextPage, onRefresh }: Props) {
    const isInitialLoading = loading && results.products.length === 0

    return (
        <FlatList
            data={results.products}
            keyExtractor={(product, index) => product.name + index}
            renderItem={({ item }) => <Product product={item} />}
            onEndReached={getNextPage}
            onEndReachedThreshold={0.5}
            refreshControl={<ListRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListFooterComponent={
                loading && !isInitialLoading ? <ActivityIndicator style={styles.footerLoader} /> : null
            }
            ListEmptyComponent={isInitialLoading ? <SkeletonRows /> : null}
            ListHeaderComponent={<View style={styles.header} />}
            showsVerticalScrollIndicator={false}
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
