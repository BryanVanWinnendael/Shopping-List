import { useCallback, useEffect } from "react"
import { StyleSheet, View } from "react-native"
import Toast from "react-native-toast-message"

import { useWeeklyCategories } from "@/hooks/weekly/useWeeklyCategories"
import { useWeeklyProducts } from "@/hooks/weekly/useWeeklyProducts"
import BottomSheet from "@/components/weekly/categories/bottomSheet"
import List from "@/components/weekly/categories/list"
import useThemes from "@/hooks/themes/useThemes"
import { Category } from "@/types/generated/models/category"
import { useAiContextStore } from "@/stores/useAiContextStore"

export default function WeeklyCategories() {
    const { vars } = useThemes()

    const {
        actions: weeklyCategoriesActions,
        refs: weeklyCategoriesRefs,
        states: weeklyCategoriesStates,
    } = useWeeklyCategories()

    const { actions: weeklyProductsActions } = useWeeklyProducts()

    useEffect(() => {
        useAiContextStore.setState({ weeklyProducts: weeklyCategoriesStates.cronProducts })
    }, [weeklyCategoriesStates.cronProducts])

    const updateCategory = useCallback(
        async (category: Category) => {
            const newCronProduct = await weeklyCategoriesActions.updateCategory(category)

            if (!newCronProduct) {
                Toast.show({
                    type: "error",
                    text1: "Error: Category failed to update",
                })
                return
            }

            await weeklyProductsActions.updateCronProduct(newCronProduct)
        },
        [weeklyCategoriesActions, weeklyProductsActions]
    )

    return (
        <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
            <List
                open={weeklyCategoriesActions.open}
                cronProducts={weeklyCategoriesStates.cronProducts}
                refreshing={weeklyCategoriesStates.loading}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
})
