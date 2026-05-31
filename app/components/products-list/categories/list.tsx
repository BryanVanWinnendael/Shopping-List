import { FlatList, Text, View } from "react-native"
import { useMemo } from "react"
import { Product, Products } from "@/types/list"
import { BottomSheetButton } from "@/components/products-list/categories/bottomSheetButton"

type Props = {
    products: Products | null
    open: (product: Product) => void
    headerHeight: number
}

export default function List({ products, open, headerHeight }: Props) {
    const textProducts = useMemo(() => {
        if (!products) return []
        return Object.values(products).filter((product) => product.type === "text")
    }, [products])

    return (
        <FlatList
            data={textProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 50 }}
            ListHeaderComponent={<View style={{ height: headerHeight }} />}
            renderItem={({ item }) => <BottomSheetButton open={open} product={item} />}
            ListEmptyComponent={<Text style={{ marginTop: 20, color: "#999" }}>No products found.</Text>}
        />
    )
}
