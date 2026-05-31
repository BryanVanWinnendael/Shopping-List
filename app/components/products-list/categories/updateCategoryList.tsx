import { CATEGORY_ORDER } from "@/lib/constants"
import { FlatList, StyleSheet, Text, View } from "react-native"
import { PressableScale } from "pressto"
import CategoryIcon from "@/components/categoryIcon"
import { Category } from "@/types/category-model"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    updateCategory: (category: Category) => void
}

export default function UpdateCategoryList({ updateCategory }: Props) {
    const { vars } = useThemes()

    return (
        <FlatList
            style={{ height: 670 }}
            data={CATEGORY_ORDER}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item: category }) => (
                <PressableScale
                    onPress={() => updateCategory(category)}
                    style={[
                        styles.card,
                        {
                            backgroundColor: vars.secondaryBackgroundColor,
                            borderColor: vars.secondaryBorderColor,
                        },
                    ]}
                >
                    <CategoryIcon category={category} />
                    <Text
                        style={{
                            color: vars.textColor,
                            fontWeight: "500",
                            fontSize: 18,
                        }}
                    >
                        {category}
                    </Text>
                </PressableScale>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
    )
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 10,
        overflow: "hidden",
        alignItems: "center",
        flexDirection: "row",
        gap: 5,
    },
})
