import { StyleSheet, View } from "react-native"
import List from "@/components/products-list/list"
import { useUpdateProduct } from "@/hooks/products-list/useUpdateProduct"
import { useUpdateProductModal } from "@/hooks/products-list/useUpdateProductModal"
import { useProductsSearchList } from "@/hooks/products-search/useProductsSearchList"
import BottomSheet from "@/components/products-list/products-search/bottomSheet"
import { Modal } from "@/components/inputs/update/modal"
import ProductInput from "@/components/inputs/productInput"
import useThemes from "@/hooks/themes/useThemes"

export default function Index() {
    const { vars } = useThemes()
    const { actions: editItemActions, states: editItemStates } = useUpdateProduct()
    const { actions: editModalActions, states: editModalStates } = useUpdateProductModal()
    const { actions: productsSearchActions, states: productsSearchStates } = useProductsSearchList()

    const closeUpdateModal = () => {
        editItemActions.reset()
        editModalActions.close()
    }

    const updateProduct = async () => {
        await editItemActions.updateProduct()
        editModalActions.close()
    }

    return (
        <>
            <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
                <List
                    setProduct={editItemActions.setProduct}
                    openEditModal={editModalActions.open}
                    openSearchProductsBottomSheet={productsSearchActions.open}
                    setQuery={productsSearchActions.setQuery}
                    searchProduct={productsSearchActions.searchProduct}
                />
                <View pointerEvents="box-none" style={styles.inputOverlay}>
                    <ProductInput />
                </View>
                <BottomSheet onClose={productsSearchActions.close} sheetRef={productsSearchStates.bottomSheetRef} />
            </View>

            <Modal
                closeUpdateModal={closeUpdateModal}
                product={editItemStates.product}
                name={editItemStates.name}
                updateName={editItemActions.updateProductPreview}
                updateProduct={updateProduct}
                isOpen={editModalStates.visible}
            />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    inputOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        backgroundColor: "transparent",
        justifyContent: "flex-end",
    },
})
