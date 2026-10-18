import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useState } from "react"
import { PressableScale } from "pressto"

import { useSettingsStore } from "@/stores/useSettingsStore"
import { CATEGORY_ORDER } from "@/lib/constants"
import useThemes from "@/hooks/themes/useThemes"
import { Category } from "@/types/generated/models/category"
import { BORDER_RADIUS_L } from "@/lib/theme"

type Props = {
    selected: Category[]
    onApply: (categories: Category[]) => void
    onClose: () => void
}

type FilterCategory = {
    label: string
    value: Category
}

const FILTER_CATEGORIES: FilterCategory[] = CATEGORY_ORDER.filter((c) => c !== "remaining" && c !== "fish").map((c) =>
    c === "meat" ? { label: "Meat / Fish", value: "meat" } : { label: c, value: c }
)

export default function Filter({ selected, onApply, onClose }: Props) {
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
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.chipsWrap}>
                    {FILTER_CATEGORIES.map(({ label, value }) => {
                        const active = localSelected.includes(value)

                        return (
                            <PressableScale
                                key={value}
                                onPress={() => toggleCategory(value)}
                                style={[
                                    styles.chip,
                                    {
                                        borderColor: active ? aColor : vars.secondaryBorderColor,
                                        backgroundColor: active ? aColor : vars.secondaryBackgroundColor,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.chipLabel,
                                        {
                                            color: active ? "#fff" : vars.textColor,
                                            fontWeight: active ? "600" : "500",
                                        },
                                    ]}
                                >
                                    {label}
                                </Text>
                            </PressableScale>
                        )
                    })}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <PressableScale
                    onPress={clearAll}
                    accessibilityRole="button"
                    accessibilityLabel="Clear filters"
                    style={[styles.clearButton, { backgroundColor: vars.secondaryBackgroundColor }]}
                >
                    <Text style={[styles.clearText, { color: vars.textColor }]}>Clear Filters</Text>
                </PressableScale>

                <PressableScale
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Show results"
                    style={[styles.applyButton, { backgroundColor: aColor }]}
                >
                    <Text style={styles.applyText}>Show results</Text>
                </PressableScale>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 64,
        paddingBottom: 74,
    },
    chipsWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS_L,
        borderWidth: 1,
    },
    chipLabel: {
        fontSize: 14,
    },
    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: "transparent",
    },
    clearButton: {
        minHeight: 50,
        borderRadius: BORDER_RADIUS_L,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    clearText: {
        fontWeight: "600",
        fontSize: 15,
    },
    applyButton: {
        flex: 1,
        minHeight: 50,
        borderRadius: BORDER_RADIUS_L,
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.16,
        shadowRadius: 8,
        elevation: 4,
    },
    applyText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
})
