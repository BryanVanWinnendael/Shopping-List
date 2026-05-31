import { useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { CATEGORY_ORDER } from "@/lib/constants"
import { PressableScale } from "pressto"
import { Category } from "@/types/category-model"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    selected: Category[]
    onApply: (categories: Category[]) => void
}

type FilterCategory = {
    label: string
    value: Category
}

const FILTER_CATEGORIES: FilterCategory[] = CATEGORY_ORDER.filter((c) => c !== "remaining" && c !== "fish").map((c) =>
    c === "meat" ? { label: "meat/fish", value: "meat" } : { label: c, value: c }
)

export default function Filter({ selected, onApply }: Props) {
    const { vars } = useThemes()
    const { aColor } = useSettingsStore()

    const [localSelected, setLocalSelected] = useState<Category[]>(selected)

    const toggleCategory = (category: Category) => {
        setLocalSelected((prev) => {
            const newSelected = prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]

            onApply(newSelected)
            return newSelected
        })
    }

    const clearAll = () => {
        setLocalSelected([])
        onApply([])
    }

    return (
        <View style={{ padding: 16 }}>
            <Text
                style={{
                    fontSize: 18,
                    fontWeight: "600",
                    marginBottom: 12,
                    color: vars.textColor,
                }}
            >
                Filter by category
            </Text>

            <ScrollView
                contentContainerStyle={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                }}
            >
                {FILTER_CATEGORIES.map(({ label, value }) => {
                    const active = localSelected.includes(value)

                    return (
                        <PressableScale
                            key={value}
                            onPress={() => toggleCategory(value)}
                            style={{
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 24,
                                borderWidth: 1,
                                borderColor: active ? aColor : vars.secondaryBorderColor,
                                backgroundColor: active ? aColor : vars.secondaryBackgroundColor,
                            }}
                        >
                            <Text
                                style={{
                                    color: active ? vars.secondaryBackgroundColor : vars.textColor,
                                    fontSize: 14,
                                }}
                            >
                                {label}
                            </Text>
                        </PressableScale>
                    )
                })}
            </ScrollView>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 20,
                }}
            >
                <PressableScale style={[styles.button, { backgroundColor: aColor }]} onPress={clearAll}>
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Clear</Text>
                </PressableScale>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 26,
        height: 52,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        width: "100%",
    },
})
