import { ScrollView, Text } from "react-native"
import { RefObject } from "react"
import GorhomBottomSheet from "@gorhom/bottom-sheet"
import CustomBottomSheet from "@/components/customBottomSheet"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    sheetRef: RefObject<GorhomBottomSheet | null>
    close: () => void
    instructions: string[]
}

export default function InstructionsBottomSheet({ sheetRef, close, instructions }: Props) {
    const { vars } = useThemes()

    return (
        <CustomBottomSheet sheetRef={sheetRef} onClose={close}>
            <Text
                style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: vars.textColor,
                    marginBottom: 20,
                }}
            >
                Instructions
            </Text>

            <ScrollView style={{ height: 650 }} showsVerticalScrollIndicator={false}>
                {instructions.map((instruction, index) => (
                    <Text
                        key={index}
                        style={{
                            color: vars.textColor,
                            fontSize: 24,
                            lineHeight: 32,
                            marginBottom: 24,
                        }}
                    >
                        <Text
                            style={{
                                color: vars.accentColor,
                                fontWeight: "700",
                            }}
                        >
                            {index + 1}.{" "}
                        </Text>
                        {instruction}
                    </Text>
                ))}
            </ScrollView>
        </CustomBottomSheet>
    )
}
