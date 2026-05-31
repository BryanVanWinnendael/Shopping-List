import { KeyboardAvoidingView, Platform, Text } from "react-native"
import CustomBottomSheet from "@/components/customBottomSheet"
import GorhomBottomSheet from "@gorhom/bottom-sheet"
import { RefObject } from "react"
import Form from "@/components/recipes/create/form"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    sheetRef: RefObject<GorhomBottomSheet | null>
    onClose: () => void
}

export default function BottomSheet({ sheetRef, onClose }: Props) {
    const { vars } = useThemes()

    return (
        <CustomBottomSheet sheetRef={sheetRef} onClose={onClose}>
            <Text
                style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: vars.textColor,
                    marginBottom: 12,
                }}
            >
                Create a Recipe
            </Text>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <Form onClose={onClose} />
            </KeyboardAvoidingView>
        </CustomBottomSheet>
    )
}
