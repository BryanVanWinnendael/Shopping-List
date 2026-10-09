import { useCallback } from "react"
import { ActivityIndicator, FlatList, StyleSheet } from "react-native"
import Log from "@/components/logs/log"
import { ProductRowSkeleton } from "@/components/native/skeleton"
import { Trace } from "@/types/generated/models/trace"
import { HEADER_HEIGHT } from "@/lib/constants"

type Props = {
    traces: Trace[]
    loading: boolean
    refreshing: boolean
    onRefresh: () => void
    onEndReached: () => void
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

const keyExtractor = (item: Trace) => item.traceId

export default function List({ traces, loading, onEndReached, refreshing, onRefresh }: Props) {
    const renderItem = useCallback(({ item }: { item: Trace }) => <Log trace={item} />, [])
    const isInitialLoading = loading && traces.length === 0

    return (
        <FlatList
            data={traces}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={styles.content}
            ListEmptyComponent={isInitialLoading ? <SkeletonRows /> : null}
            ListFooterComponent={loading && !isInitialLoading ? <ActivityIndicator style={styles.loader} /> : null}
        />
    )
}

const styles = StyleSheet.create({
    content: {
        paddingTop: HEADER_HEIGHT,
        paddingBottom: 90,
    },
    loader: {
        marginTop: 10,
    },
})
