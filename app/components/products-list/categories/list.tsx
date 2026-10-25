import { FlatList, StyleSheet, Text, View } from "react-native"
import { useMemo } from "react"
import { Product, Products } from "@/types/list"
import { BottomSheetButton } from "@/components/products-list/categories/bottomSheetButton"
import { HEADER_HEIGHT } from "@/lib/constants"

type Props = {
    products: Products | null
    open: (product: Product) => void
}

export default function List({ products, open }: Props) {
    const textProducts = useMemo(() => {
        if (!products) return []
        return Object.values(products).filter((product) => product.type === "text")
    }, [products])

    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            data={textProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={<View style={styles.headerSpacer} />}
            renderItem={({ item }) => <BottomSheetButton open={open} product={item} />}
            ListEmptyComponent={<Text style={styles.emptyText}>No products found.</Text>}
        />
    )
}

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 50,
    },
    headerSpacer: {
        height: HEADER_HEIGHT,
    },
    emptyText: {
        marginTop: 20,
        color: "#999",
    },
})
