import { useRef } from "react"
import { FlatList } from "react-native"
import { useHeaderHeight } from "@react-navigation/elements"
import { Product as ProductType } from "@/types/list"
import { useProductsListStore } from "@/stores/useProductsListStore"
import Product from "@/components/products-list/product"
import { Category } from "@/types/category-model"

type Props = {
    openSearchProductsBottomSheet: () => void
    openEditModal: () => void
    setProduct: (product: ProductType) => void
    searchProduct: (product: string, category: Category) => void
    setQuery: (query: string | null) => void
}

export default function List({
    openSearchProductsBottomSheet,
    openEditModal,
    setProduct,
    searchProduct,
    setQuery,
}: Props) {
    const { products } = useProductsListStore()
    const headerHeight = useHeaderHeight()
    const scrollRef = useRef<FlatList>(null)

    const openEditProductModal = (product: ProductType) => {
        setProduct(product)
        openEditModal()
    }

    const productsList = products ? Object.values(products) : []

    return (
        <FlatList
            ref={scrollRef}
            data={productsList}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingTop: headerHeight,
                paddingBottom: headerHeight + 85,
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
