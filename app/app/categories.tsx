import { StyleSheet, View } from "react-native"

import { useProductsListStore } from "@/stores/useProductsListStore"
import { useCategories } from "@/hooks/categories/useCategories"
import BottomSheet from "@/components/products-list/categories/bottomSheet"
import TrainButton from "@/components/products-list/categories/trainButton"
import List from "@/components/products-list/categories/list"
import useThemes from "@/hooks/themes/useThemes"

export default function Categories() {
    const { vars } = useThemes()
    const products = useProductsListStore((state) => state.products)
    const { refs, actions, states } = useCategories()

    return (
        <>
            <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
                <TrainButton trainModel={actions.trainModel} training={states.training} />

                <List open={actions.open} products={products} />
            </View>

            <BottomSheet
                close={actions.close}
                bottomSheetRef={refs.bottomSheetRef}
                updateCategory={actions.updateCategory}
            />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
})
