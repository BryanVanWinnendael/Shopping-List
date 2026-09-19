import { Text, TextInput, View } from "react-native"
import { PressableScale } from "pressto"
import { X } from "lucide-react-native"

import useThemes from "@/hooks/themes/useThemes"
import { GlassView } from "expo-glass-effect"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    instruction: string
    index: number
    onUpdate: (index: number, value: string) => void
    onRemove: (index: number) => void
}

export default function Instruction({ instruction, index, onUpdate, onRemove }: Props) {
    const { vars, theme } = useThemes()

    const colorScheme = theme === "light" ? "light" : "dark"

    return (
        <GlassView
            glassEffectStyle="regular"
            colorScheme={colorScheme}
            tintColor={vars.secondaryBackgroundColor}
            style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: BORDER_RADIUS_L,
            }}
        >
            <View
                style={{
                    width: 30,
                    height: 46,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: BORDER_RADIUS_FULL,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: vars.backgroundColor,
                    }}
                >
                    <Text
                        style={{
                            color: vars.textColor,
                            fontSize: 13,
                            fontWeight: "600",
                            textAlign: "center",
                        }}
                    >
                        {index + 1}
                    </Text>
                </View>
            </View>

            {/* Input */}
            <TextInput
                value={instruction}
                onChangeText={(text) => onUpdate(index, text)}
                placeholder={`Step ${index + 1}`}
                placeholderTextColor="gray"
                multiline
                textAlignVertical="top"
                scrollEnabled
                keyboardAppearance={theme === "light" ? "light" : "dark"}
                style={{
                    flex: 1,
                    minHeight: 46,
                    maxHeight: 120,
                    paddingHorizontal: 13,
                    paddingVertical: 11,
                    borderRadius: BORDER_RADIUS_M,
                    backgroundColor: vars.backgroundColor,
                    borderWidth: 1,
                    borderColor: vars.secondaryBorderColor,
                    color: vars.textColor,
                    fontSize: 15,
                    lineHeight: 21,
                }}
            />

            <View
                style={{
                    width: 30,
                    height: 46,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <PressableScale
                    onPress={() => onRemove(index)}
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: BORDER_RADIUS_FULL,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <X size={15} color={vars.textColor} strokeWidth={2} />
                </PressableScale>
            </View>
        </GlassView>
    )
}
