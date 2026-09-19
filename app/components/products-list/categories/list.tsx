import { FlatList, Text, View } from "react-native"
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
            contentContainerStyle={{ paddingBottom: 50 }}
            ListHeaderComponent={<View style={{ height: HEADER_HEIGHT }} />}
            renderItem={({ item }) => <BottomSheetButton open={open} product={item} />}
            ListEmptyComponent={<Text style={{ marginTop: 20, color: "#999" }}>No products found.</Text>}
        />
    )
}
