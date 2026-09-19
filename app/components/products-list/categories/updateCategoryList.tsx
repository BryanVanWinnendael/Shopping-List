import { CATEGORY_ORDER } from "@/lib/constants"
import { FlatList, Text, View } from "react-native"
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
            style={{ flex: 1 }}
            data={CATEGORY_ORDER}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 64,
                paddingBottom: 20,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item: category }) => (
                <PressableScale
                    onPress={() => updateCategory(category)}
                    style={{
                        minHeight: 58,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: BORDER_RADIUS_M,
                        borderWidth: 1,
                        borderColor: vars.secondaryBorderColor,
                        backgroundColor: vars.secondaryBackgroundColor,
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            width: 38,
                            height: 38,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                        }}
                    >
                        <CategoryIcon category={category} />
                    </View>

                    <Text
                        style={{
                            flex: 1,
                            color: vars.textColor,
                            fontSize: 16,
                            fontWeight: "600",
                        }}
                    >
                        {category}
                    </Text>
                </PressableScale>
            )}
        />
    )
}
