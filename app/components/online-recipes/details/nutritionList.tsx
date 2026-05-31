import { Text, View } from "react-native"
import { Nutrition } from "@/types/recipes"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    nutrition: Nutrition
}

export default function NutritionList({ nutrition }: Props) {
    const { vars } = useThemes()

    const items = [
        { label: "Calories", value: nutrition.calories },
        { label: "Carbs", value: nutrition.carbohydrates },
        { label: "Sugars", value: nutrition.sugars },
        { label: "Fat", value: nutrition.fat },
        { label: "Sat. Fat", value: nutrition.saturatedFat },
        { label: "Protein", value: nutrition.protein },
        { label: "Fiber", value: nutrition.fiber },
    ]

    return (
        <View style={{ marginTop: 24 }}>
            <Text
                style={{
                    color: vars.textColor,
                    fontSize: 22,
                    fontWeight: "700",
                    marginBottom: 16,
                }}
            >
                Nutritions
            </Text>

            <View
                style={{
                    borderRadius: 16,
                    backgroundColor: vars.secondaryBackgroundColor,
                    overflow: "hidden",
                }}
            >
                {items.map((item, index) => (
                    <View
                        key={item.label}
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            borderBottomWidth: index === items.length - 1 ? 0 : 1,
                            borderBottomColor: vars.secondaryBorderColor,
                        }}
                    >
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "500",
                            }}
                        >
                            {item.label}
                        </Text>

                        <Text
                            style={{
                                color: vars.accentColor,
                                fontWeight: "600",
                            }}
                        >
                            {item.value}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    )
}
