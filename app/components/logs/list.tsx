import { useCallback } from "react"
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native"
import { ScrollText } from "lucide-react-native"
import Log from "@/components/logs/log"
import { ProductRowSkeleton } from "@/components/native/skeleton"
import useThemes from "@/hooks/themes/useThemes"
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

function EmptyState() {
    const { vars } = useThemes()

    return (
        <View style={styles.empty}>
            <ScrollText size={28} color={vars.secondaryTextColor} />
            <Text style={[styles.emptyTitle, { color: vars.textColor }]}>No logs found</Text>
            <Text style={[styles.emptySubtitle, { color: vars.secondaryTextColor }]}>
                Logs appear here as you use the app.
            </Text>
        </View>
    )
}

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
            ListEmptyComponent={isInitialLoading ? <SkeletonRows /> : <EmptyState />}
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
    empty: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 4,
    },
    emptySubtitle: {
        fontSize: 13,
    },
})
