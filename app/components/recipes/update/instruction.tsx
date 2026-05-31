import { TextInput, View } from "react-native"
import { PressableScale } from "pressto"
import { X } from "lucide-react-native"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    instruction: string
    index: number
    onUpdate: (index: number, value: string) => void
    onRemove: (index: number) => void
}

export default function Instruction({ instruction, index, onUpdate, onRemove }: Props) {
    const { vars } = useThemes()

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
                gap: 8,
            }}
        >
            <View style={{ flex: 1 }}>
                <TextInput
                    value={instruction}
                    onChangeText={(text) => onUpdate(index, text)}
                    placeholder={`Step ${index + 1}`}
                    placeholderTextColor="#aaa"
                    style={{
                        color: vars.textColor,
                        backgroundColor: vars.secondaryBackgroundColor,
                        borderWidth: 1,
                        borderColor: vars.secondaryBorderColor,
                        borderRadius: 14,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                    }}
                />
            </View>

            <PressableScale
                onPress={() => onRemove(index)}
                style={{
                    padding: 8,
                    borderRadius: 24,
                    borderWidth: 1,
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderColor: vars.secondaryBorderColor,
                }}
            >
                <X size={16} color={vars.textColor} />
            </PressableScale>
        </View>
    )
}
