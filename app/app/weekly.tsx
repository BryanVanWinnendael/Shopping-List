import { StyleSheet, View } from "react-native"
import Input from "@/components/weekly/input"
import List from "@/components/weekly/list"
import { useWeeklyProducts } from "@/hooks/weekly/useWeeklyProducts"
import useThemes from "@/hooks/themes/useThemes"

export default function Weekly() {
    const { vars } = useThemes()
    const { states, actions } = useWeeklyProducts()

    return (
        <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
            <List
                getCronProducts={actions.getCronProducts}
                deleteCronProduct={actions.deleteCronProduct}
                cronProducts={states.cronProducts}
            />

            <View pointerEvents="box-none" style={styles.inputOverlay}>
                <Input
                    createCronProduct={actions.createCronProduct}
                    setProduct={actions.setProduct}
                    product={states.product}
                    loading={states.loading}
                />
            </View>
        </View>
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
        height: "100%",
        backgroundColor: "transparent",
        display: "flex",
        justifyContent: "flex-end",
    },
})
