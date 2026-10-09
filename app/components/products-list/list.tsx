import { useRef } from "react"
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from "react-native"
import { Product as ProductType } from "@/types/list"
import { useProductsListStore } from "@/stores/useProductsListStore"
import Product from "@/components/products-list/product"
import { ProductRowSkeleton } from "@/components/native/skeleton"
import { Category } from "@/types/generated/models/category"
import { HEADER_HEIGHT } from "@/lib/constants"

const SKELETON_ROWS = Array.from({ length: 7 }, (_, index) => index)

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

    if (products === null) {
        return (
            <FlatList
                data={SKELETON_ROWS}
                keyExtractor={(item) => `skeleton-${item}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
                renderItem={({ index }) => <ProductRowSkeleton index={index} />}
            />
        )
    }

    const productsList = Object.values(products)

    return (
        <FlatList
            onScroll={onScroll}
            ref={scrollRef}
            data={productsList}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
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

const styles = StyleSheet.create({
    contentContainer: {
        paddingTop: HEADER_HEIGHT,
        paddingBottom: HEADER_HEIGHT + 85,
    },
})
