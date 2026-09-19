import { useRef } from "react"
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import { Product as ProductType } from "@/types/list"
import { useProductsListStore } from "@/stores/useProductsListStore"
import Product from "@/components/products-list/product"
import { Category } from "@/types/generated/models/category"
import { HEADER_HEIGHT } from "@/lib/constants"

type Props = {
    openSearchProductsBottomSheet: () => void
    openEditModal: () => void
    setProduct: (product: ProductType) => void
    searchProduct: (product: string, category: Category) => void
    setQuery: (query: string | null) => void
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}

export default function List({
    openSearchProductsBottomSheet,
    openEditModal,
    setProduct,
    searchProduct,
    setQuery,
    onScroll,
}: Props) {
    const { products } = useProductsListStore()
    const scrollRef = useRef<FlatList>(null)

    const openEditProductModal = (product: ProductType) => {
        setProduct(product)
        openEditModal()
    }

    const productsList = products ? Object.values(products) : []

    return (
        <FlatList
            onScroll={onScroll}
            ref={scrollRef}
            data={productsList}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingTop: HEADER_HEIGHT,
                paddingBottom: HEADER_HEIGHT + 85,
            }}
            renderItem={({ item }) => (
                <Product
                    product={item}
                    scrollRef={scrollRef}
                    openEditProductModal={openEditProductModal}
                    openSearchProductsBottomSheet={openSearchProductsBottomSheet}
                    searchProduct={searchProduct}
                    setQuery={setQuery}
                />
            )}
        />
    )
}
