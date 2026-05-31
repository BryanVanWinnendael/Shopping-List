import { FlatList, StyleSheet, View } from "react-native"
import { Log as LogType } from "@/types/logs"
import Log from "@/components/logs/log"

type Props = {
    logs: LogType[]
    headerHeight: number
}

export default function List({ logs, headerHeight }: Props) {
    return (
        <FlatList
            contentContainerStyle={styles.flatListContent}
            data={logs}
            renderItem={({ item }) => <Log log={item} />}
            keyExtractor={(_, index) => String(index)}
            ListHeaderComponent={<View style={{ height: headerHeight }} />}
        />
    )
}

const styles = StyleSheet.create({
    flatListContent: {
        marginHorizontal: 8,
    },
})
