import { View } from "react-native"
import { useHeaderHeight } from "@react-navigation/elements"
import { useProductsListStore } from "@/stores/useProductsListStore"
import { useCategories } from "@/hooks/categories/useCategories"
import BottomSheet from "@/components/products-list/categories/bottomSheet"
import TrainButton from "@/components/products-list/categories/trainButton"
import List from "@/components/products-list/categories/list"
import useThemes from "@/hooks/themes/useThemes"

export default function Categories() {
    const { vars } = useThemes()
    const { products } = useProductsListStore()
    const { refs, actions, states } = useCategories()
    const headerHeight = useHeaderHeight()

    return (
        <>
            <View style={{ flex: 1, backgroundColor: vars.backgroundColor, padding: 16 }}>
                <TrainButton trainModel={actions.trainModel} training={states.training} />
                <List open={actions.open} headerHeight={headerHeight} products={products} />
            </View>

            <BottomSheet
                close={actions.close}
                bottomSheetRef={refs.bottomSheetRef}
                updateCategory={actions.updateCategory}
            />
        </>
    )
}
