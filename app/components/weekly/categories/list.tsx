import { FlatList, RefreshControl, Text, View } from "react-native"
import { CronProduct } from "@/types/cron"
import { BottomSheetButton } from "@/components/weekly/categories/bottomSheetButton"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    cronProducts: CronProduct[]
    headerHeight: number
    open: (cronProduct: CronProduct) => void
    refreshing: boolean
    refresh: () => void
}

export default function List({ cronProducts, headerHeight, refresh, refreshing, open }: Props) {
    const { vars } = useThemes()

    return (
        <FlatList
            data={cronProducts}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{ paddingBottom: 50 }}
            ListHeaderComponent={<View style={{ height: headerHeight }} />}
            renderItem={({ item }) => <BottomSheetButton cronProduct={item} open={open} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={vars.textColor} />}
            ListEmptyComponent={<Text style={{ marginTop: 20, color: "#999" }}>No weekly products found.</Text>}
        />
    )
}
