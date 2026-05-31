import CustomBottomSheet from "@/components/customBottomSheet"
import { Text } from "react-native"
import { RefObject } from "react"
import { Category } from "@/types/category-model"
import GorhomBottomSheet from "@gorhom/bottom-sheet"
import UpdateCategoryList from "@/components/products-list/categories/updateCategoryList"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    bottomSheetRef: RefObject<GorhomBottomSheet | null>
    updateCategory: (category: Category) => void
    close: () => void
}

export default function BottomSheet({ bottomSheetRef, updateCategory, close }: Props) {
    const { vars } = useThemes()

    return (
        <CustomBottomSheet sheetRef={bottomSheetRef} onClose={close}>
            <Text
                style={{
                    fontSize: 18,
                    fontWeight: "600",
                    marginBottom: 12,
                    color: vars.textColor,
                }}
            >
                Select New Category
            </Text>
            <UpdateCategoryList updateCategory={updateCategory} />
        </CustomBottomSheet>
    )
}
