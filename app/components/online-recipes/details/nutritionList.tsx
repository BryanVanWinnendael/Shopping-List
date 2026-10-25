import { StyleSheet, Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_M } from "@/lib/theme"
import { Nutrition } from "@/types/generated/models/nutrition"

type Props = {
    nutrition: Nutrition
}

const ITEMS: { label: string; key: keyof Nutrition }[] = [
    { label: "Calories", key: "calories" },
    { label: "Carbs", key: "carbohydrates" },
    { label: "Sugars", key: "sugars" },
    { label: "Fat", key: "fat" },
    { label: "Sat. Fat", key: "saturatedFat" },
    { label: "Protein", key: "protein" },
    { label: "Fiber", key: "fiber" },
]

export default function NutritionList({ nutrition }: Props) {
    const { vars } = useThemes()

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: vars.textColor }]}>Nutritions</Text>

            <View style={[styles.card, { backgroundColor: vars.secondaryBackgroundColor }]}>
                {ITEMS.map(({ label, key }, index) => (
                    <View
                        key={key}
                        style={[
                            styles.row,
                            index < ITEMS.length - 1 && {
                                borderBottomWidth: 1,
                                borderBottomColor: vars.secondaryBorderColor,
                            },
                        ]}
                    >
                        <Text style={[styles.label, { color: vars.textColor }]}>{label}</Text>
                        <Text style={[styles.value, { color: vars.accentColor }]}>{nutrition[key]}</Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 16,
    },
    card: {
        borderRadius: BORDER_RADIUS_M,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    label: {
        fontWeight: "500",
    },
    value: {
        fontWeight: "600",
    },
})
