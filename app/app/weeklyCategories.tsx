import {View} from "react-native"
import {useHeaderHeight} from "@react-navigation/elements"
import {useWeeklyCategories} from "@/hooks/weekly/useWeeklyCategories"
import BottomSheet from "@/components/weekly/categories/bottomSheet"
import List from "@/components/weekly/categories/list"
import {Category} from "@/types/category-model"
import {useWeeklyProducts} from "@/hooks/weekly/useWeeklyProducts"
import useThemes from "@/hooks/themes/useThemes"
import Toast from "react-native-toast-message"

export default function WeeklyCategories() {
    const { vars } = useThemes()
    const {
        actions: weeklyCategoriesActions,
        refs: weeklyCategoriesRefs,
        states: weeklyCategoriesStates,
    } = useWeeklyCategories()
    const { actions: weeklyProductsActions } = useWeeklyProducts()
    const headerHeight = useHeaderHeight()

    const updateCategory = async (category: Category) => {
        const newCronProduct = await weeklyCategoriesActions.updateCategory(category)
        if (!newCronProduct) {
            Toast.show({
                type: "error",
                text1: "Error: Category failed to update",
            })
            return
        }

        await weeklyProductsActions.updateCronProduct(newCronProduct)
    }

    return (
        <View style={{ flex: 1, backgroundColor: vars.backgroundColor, padding: 16 }}>
            <List
                open={weeklyCategoriesActions.open}
                cronProducts={weeklyCategoriesStates.cronProducts}
                refreshing={weeklyCategoriesStates.loading}
                headerHeight={headerHeight}
                refresh={weeklyCategoriesActions.getCronProducts}
            />
            <BottomSheet
                close={weeklyCategoriesActions.close}
                sheetRef={weeklyCategoriesRefs.bottomSheetRef}
                updateCategory={updateCategory}
            />
        </View>
    )
}
