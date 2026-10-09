import { BlurView } from "expo-blur"
import { RefObject } from "react"
import { StyleSheet, Text, View } from "react-native"

import AppBottomSheet, { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import UpdateCategoryList from "@/components/products-list/categories/updateCategoryList"
import useThemes from "@/hooks/themes/useThemes"
import { Category } from "@/types/generated/models/category"

type Props = {
    sheetRef: RefObject<BottomSheetRef | null>
    close: () => void
    updateCategory: (category: Category) => void
}

export default function BottomSheet({ sheetRef, close, updateCategory }: Props) {
    const { vars, appearance } = useThemes()

    return (
        <AppBottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={["45%", "70%"]}
            enablePanDownToClose
            onClose={close}
            backgroundMode="adaptive"
        >
            <View style={styles.container}>
                <View style={styles.headerWrap}>
                    <BlurView intensity={10} tint={appearance} style={styles.blur}>
                        <Text style={[styles.title, { color: vars.textColor }]}>Select Category</Text>
                    </BlurView>
                </View>
                <UpdateCategoryList updateCategory={updateCategory} />
            </View>
        </AppBottomSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerWrap: {
        position: "absolute",
        top: -40,
        left: 0,
        right: 0,
        height: 88,
        zIndex: 10,
        overflow: "hidden",
    },
    blur: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
    },
})
