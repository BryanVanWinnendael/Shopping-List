import { useEffect } from "react"
import { StyleSheet, View } from "react-native"
import List from "@/components/logs/list"
import ClearButton from "@/components/logs/clearButton"

import { useLogs } from "@/hooks/logs/useLogs"
import useThemes from "@/hooks/themes/useThemes"
import { SearchBar } from "@/components/logs/searchBar"
import { useAiContextStore } from "@/stores/useAiContextStore"

export default function Logs() {
    const { vars } = useThemes()

    const { actions, states } = useLogs()
    const setLogSummary = useAiContextStore((state) => state.setLogSummary)

    useEffect(() => {
        setLogSummary({
            total: states.traces.length,
            recentTraceIds: states.traces.slice(0, 10).map((trace) => trace.traceId),
        })
    }, [states.traces, setLogSummary])

    return (
        <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
            <SearchBar value={states.query} updateQuery={actions.updateQuery} />

            <ClearButton clearLogs={actions.deleteLogs} loading={states.loadingDelete} />

            <List
                traces={states.traces}
                loading={states.loading}
                refreshing={states.refreshing}
                onRefresh={actions.refresh}
                onEndReached={actions.getNextPage}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        padding: 16,
    },
})
