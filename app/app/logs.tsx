import { useHeaderHeight } from "@react-navigation/elements"
import { StyleSheet, View } from "react-native"
import List from "@/components/logs/list"
import ClearButton from "@/components/logs/clearButton"

import { useLogs } from "@/hooks/logs/useLogs"
import useThemes from "@/hooks/themes/useThemes"
import { SearchBar } from "@/components/logs/searchBar"

export default function Logs() {
    const { vars } = useThemes()
    const headerHeight = useHeaderHeight()

    const { actions, states } = useLogs()

    return (
        <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
            <SearchBar value={states.query} updateQuery={actions.updateQuery} />

            <ClearButton clearLogs={actions.deleteLogs} loading={states.loadingDelete} />

            <List
                traces={states.traces}
                headerHeight={headerHeight}
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
    floatingButtons: {
        position: "absolute",
        bottom: 40,
        right: 40,
        flexDirection: "row",
        gap: 8,
        zIndex: 10,
    },
})
