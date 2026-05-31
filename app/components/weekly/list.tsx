import { useState } from "react"
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native"
import { useHeaderHeight } from "@react-navigation/elements"
import { Info, Trash } from "lucide-react-native"
import { PressableScale } from "pressto"
import { CronProduct } from "@/types/cron"
import CategoryIcon from "@/components/categoryIcon"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    deleteCronProduct: (id: string | null | undefined) => void
    cronProducts: CronProduct[]
    getCronProducts: () => Promise<void>
}

export default function List({ deleteCronProduct, cronProducts, getCronProducts }: Props) {
    const { vars } = useThemes()
    const headerHeight = useHeaderHeight()

    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = async () => {
        setRefreshing(true)
        await getCronProducts()
        setRefreshing(false)
    }

    const renderItem = (cronProduct: CronProduct) => (
        <View
            style={[
                styles.renderItem,
                {
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderColor: vars.secondaryBorderColor,
                },
            ]}
        >
            <CategoryIcon category={cronProduct.category} />
            <Text style={[styles.title, { color: vars.textColor, flex: 1 }]}>{cronProduct.product}</Text>
            <PressableScale onPress={() => deleteCronProduct(cronProduct.id)}>
                <Trash size={20} color={vars.textColor} />
            </PressableScale>
        </View>
    )

    return (
        <View style={styles.container}>
            <View style={{ width: "100%" }}>
                <View style={{ height: headerHeight }} />
                <View
                    style={{
                        backgroundColor: `${vars.accentColor}33`,
                        borderRadius: 20,
                        padding: 12,
                        marginHorizontal: 8,
                        marginBottom: 16,
                        marginTop: 10,
                        flexDirection: "row",
                        gap: 12,
                        alignItems: "center",
                    }}
                >
                    <Info color={vars.accentColor} />
                    <Text style={{ fontSize: 15, color: vars.accentColor }}>
                        Items in this list get automatically added every Friday to the shopping list.
                    </Text>
                </View>
            </View>

            <FlatList
                contentContainerStyle={styles.flatListContent}
                data={cronProducts}
                renderItem={({ item }) => renderItem(item)}
                keyExtractor={(_, index) => String(index)}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: vars.textColor }}>No weekly items found.</Text>
                    </View>
                }
                refreshing={refreshing}
                onRefresh={onRefresh}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={vars.textColor}
                        colors={[vars.textColor]}
                    />
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
    },
    flatListContent: {
        paddingHorizontal: 8,
        paddingBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 32,
    },
    renderItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        marginVertical: 6,
    },
    title: {
        fontWeight: "600",
        fontSize: 16,
    },
})
