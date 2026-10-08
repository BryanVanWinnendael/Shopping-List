import { useCallback } from "react"
import { ActivityIndicator, FlatList, StyleSheet } from "react-native"
import Log from "@/components/logs/log"
import { Trace } from "@/types/generated/models/trace"
import { HEADER_HEIGHT } from "@/lib/constants"

type Props = {
    traces: Trace[]
    loading: boolean
    refreshing: boolean
    onRefresh: () => void
    onEndReached: () => void
}

const keyExtractor = (item: Trace) => item.traceId

export default function List({ traces, loading, onEndReached, refreshing, onRefresh }: Props) {
    const renderItem = useCallback(({ item }: { item: Trace }) => <Log trace={item} />, [])

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
            ListFooterComponent={loading ? <ActivityIndicator style={styles.loader} /> : null}
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
