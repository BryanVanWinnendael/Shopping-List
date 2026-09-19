import { FlatList, RefreshControl, Text, View } from "react-native"
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
            contentContainerStyle={{ paddingBottom: 50 }}
            ListHeaderComponent={<View style={{ height: HEADER_HEIGHT }} />}
            renderItem={({ item }) => <BottomSheetButton cronProduct={item} open={open} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={vars.textColor} />}
            ListEmptyComponent={<Text style={{ marginTop: 20, color: "#999" }}>No weekly products found.</Text>}
        />
    )
}
