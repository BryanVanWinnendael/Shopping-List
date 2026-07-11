import { Text } from "react-native"
import CustomBottomSheet from "@/components/customBottomSheet"
import { RefObject } from "react"
import GorhomBottomSheet from "@gorhom/bottom-sheet"
import UpdateCategoryList from "@/components/products-list/categories/updateCategoryList"
import useThemes from "@/hooks/themes/useThemes"
import { Category } from "@/types/generated/models/category"

type Props = {
    sheetRef: RefObject<GorhomBottomSheet | null>
    close: () => void
    updateCategory: (category: Category) => void
}

export default function BottomSheet({ sheetRef, close, updateCategory }: Props) {
    const { vars } = useThemes()

    return (
        <CustomBottomSheet sheetRef={sheetRef} onClose={close}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12, color: vars.textColor }}>
                Select New Category
            </Text>

            <UpdateCategoryList updateCategory={updateCategory} />
        </CustomBottomSheet>
    )
}
