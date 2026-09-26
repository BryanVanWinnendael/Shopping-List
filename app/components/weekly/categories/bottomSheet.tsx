import { BlurView } from "expo-blur"
import { RefObject } from "react"
import { Text, View } from "react-native"

import AppBottomSheet, { BottomSheetRef } from "@/components/native/appBottomSheet"
import UpdateCategoryList from "@/components/products-list/categories/updateCategoryList"
import useThemes from "@/hooks/themes/useThemes"
import { Category } from "@/types/generated/models/category"

type Props = {
    sheetRef: RefObject<BottomSheetRef | null>
    close: () => void
    updateCategory: (category: Category) => void
}

export default function BottomSheet({ sheetRef, close, updateCategory }: Props) {
    const { vars, theme } = useThemes()

    return (
        <AppBottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={["45%", "70%"]}
            enablePanDownToClose
            onClose={close}
            backgroundMode="adaptive"
            backgroundColor={vars.backgroundColor}
        >
            <View style={{ flex: 1 }}>
                <View
                    style={{
                        position: "absolute",
                        top: -40,
                        left: 0,
                        right: 0,
                        height: 88,
                        zIndex: 10,
                        overflow: "hidden",
                    }}
                >
                    <BlurView
                        intensity={10}
                        tint={theme === "light" ? "light" : "dark"}
                        style={{
                            flex: 1,
                            paddingHorizontal: 20,
                            paddingTop: 48,
                            paddingBottom: 10,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 22,
                                fontWeight: "700",
                                color: vars.textColor,
                            }}
                        >
                            Select Category
                        </Text>
                    </BlurView>
                </View>

                <UpdateCategoryList updateCategory={updateCategory} />
            </View>
        </AppBottomSheet>
    )
}
