import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native"
import { BottomSheetButton } from "@/components/weekly/categories/bottomSheetButton"
import useThemes from "@/hooks/themes/useThemes"
import { CronProduct } from "@/types/generated/models/cron_product"
import { HEADER_HEIGHT } from "@/lib/constants"

type Props = {
    cronProducts: CronProduct[]
    open: (cronProduct: CronProduct) => void
    refreshing: boolean
    refresh: () => void
}

export default function List({ cronProducts, refresh, refreshing, open }: Props) {
    const { vars } = useThemes()

    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            data={cronProducts}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={styles.content}
            ListHeaderComponent={<View style={styles.header} />}
            renderItem={({ item }) => <BottomSheetButton cronProduct={item} open={open} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={vars.textColor} />}
            ListEmptyComponent={<Text style={styles.emptyText}>No weekly products found.</Text>}
        />
    )
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 50,
    },
    header: {
        height: HEADER_HEIGHT,
    },
    emptyText: {
        marginTop: 20,
        color: "#999",
    },
})
