import { useHeaderHeight } from "@react-navigation/elements"
import { StyleSheet, View } from "react-native"
import List from "@/components/logs/list"
import { useLogs } from "@/hooks/logs/useLogs"
import useThemes from "@/hooks/themes/useThemes"
import ClearButton from "@/components/logs/clearButton"

export default function Logs() {
    const { vars } = useThemes()
    const headerHeight = useHeaderHeight()
    const { actions, states } = useLogs()

    return (
        <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
            <View style={styles.floatingButtons}>
                <ClearButton clearLogs={actions.deleteLogs} loading={states.loadingDelete} />
            </View>

            <List
                traces={states.traces}
                headerHeight={headerHeight}
                hasNext={states.hasNext}
                loading={states.loading}
                refreshing={states.refreshing}
                onRefresh={actions.refresh}
                onEndReached={actions.loadNextPage}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
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
