import {ActivityIndicator, FlatList, StyleSheet, View} from "react-native"
import Log from "@/components/logs/log"
import {Trace} from "@/types/logs"

type Props = {
    traces: Trace[]
    headerHeight: number
    hasNext: boolean
    loading: boolean
    refreshing: boolean
    onRefresh: () => void
    onEndReached: () => void
}

export default function List({ traces, headerHeight, hasNext, loading, onEndReached, refreshing, onRefresh }: Props) {
    return (
        <FlatList
            data={traces}
            contentContainerStyle={styles.flatListContent}
            renderItem={({ item }) => <Log trace={item} />}
            keyExtractor={(item, index) => item.traceId + index}
            ListHeaderComponent={<View style={{ height: headerHeight }} />}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListFooterComponent={
                hasNext && loading ? (
                    <View style={styles.footer}>
                        <ActivityIndicator />
                    </View>
                ) : null
            }
        />
    )
}

const styles = StyleSheet.create({
    flatListContent: {
        marginHorizontal: 8,
        paddingBottom: 24,
    },
    footer: {
        paddingVertical: 24,
    },
})
