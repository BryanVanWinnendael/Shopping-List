import { CATEGORY_ORDER } from "@/lib/constants"
import { FlatList, StyleSheet, Text, View } from "react-native"
import { PressableScale } from "pressto"

import CategoryIcon from "@/components/categoryIcon"
import useThemes from "@/hooks/themes/useThemes"
import { Category } from "@/types/generated/models/category"
import { BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    updateCategory: (category: Category) => void
}

export default function UpdateCategoryList({ updateCategory }: Props) {
    const { vars } = useThemes()

    return (
        <FlatList
            style={styles.list}
            data={CATEGORY_ORDER}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item: category }) => (
                <PressableScale
                    onPress={() => updateCategory(category)}
                    style={[
                        styles.row,
                        {
                            borderColor: vars.secondaryBorderColor,
                            backgroundColor: vars.secondaryBackgroundColor,
                        },
                    ]}
                >
                    <View style={styles.iconContainer}>
                        <CategoryIcon category={category} />
                    </View>

                    <Text style={[styles.label, { color: vars.textColor }]}>{category}</Text>
                </PressableScale>
            )}
        />
    )
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 64,
        paddingBottom: 20,
    },
    separator: {
        height: 8,
    },
    row: {
        minHeight: 58,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS_M,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 38,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    label: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
    },
})
