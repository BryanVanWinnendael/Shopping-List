import { ActivityIndicator, FlatList, View } from "react-native"
import Log from "@/components/logs/log"
import { Trace } from "@/types/generated/models/trace"

type Props = {
    traces: Trace[]
    headerHeight: number
    loading: boolean
    refreshing: boolean
    onRefresh: () => void
    onEndReached: () => void
}

export default function List({ traces, headerHeight, loading, onEndReached, refreshing, onRefresh }: Props) {
    return (
        <FlatList
            data={traces}
            renderItem={({ item }) => <Log trace={item} />}
            keyExtractor={(item, index) => item.traceId + index}
            ListHeaderComponent={<View style={{ height: headerHeight }} />}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingBottom: 90,
            }}
            ListFooterComponent={loading ? <ActivityIndicator style={{ marginTop: 10 }} /> : null}
        />
    )
}
