import { ScrollView, Text, View } from "react-native"
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
}

type FilterCategory = {
    label: string
    value: Category
}

const FILTER_CATEGORIES: FilterCategory[] = CATEGORY_ORDER.filter((c) => c !== "remaining" && c !== "fish").map((c) =>
    c === "meat" ? { label: "Meat / Fish", value: "meat" } : { label: c, value: c }
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
        <View style={{ flex: 1 }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 64,
                    paddingBottom: 74,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={{
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
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    borderRadius: BORDER_RADIUS_L,
                                    borderWidth: 1,
                                    borderColor: active ? aColor : vars.borderColor,
                                    backgroundColor: active ? aColor : vars.backgroundColor,
                                }}
                            >
                                <Text
                                    style={{
                                        color: active ? "#fff" : vars.textColor,
                                        fontSize: 14,
                                        fontWeight: active ? "600" : "500",
                                    }}
                                >
                                    {label}
                                </Text>
                            </PressableScale>
                        )
                    })}
                </View>
            </ScrollView>

            <View
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingHorizontal: 20,
                    paddingTop: 8,
                    paddingBottom: 8,
                    backgroundColor: "transparent",
                }}
            >
                <PressableScale
                    onPress={clearAll}
                    style={{
                        minHeight: 50,
                        borderRadius: BORDER_RADIUS_L,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: aColor,
                        shadowOffset: {
                            width: 0,
                            height: 4,
                        },
                        shadowOpacity: 0.16,
                        shadowRadius: 8,
                        elevation: 4,
                    }}
                >
                    <Text
                        style={{
                            color: "#fff",
                            fontWeight: "700",
                            fontSize: 15,
                        }}
                    >
                        Clear Filters
                    </Text>
                </PressableScale>
            </View>
        </View>
    )
}
