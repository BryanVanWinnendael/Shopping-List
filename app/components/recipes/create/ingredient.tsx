import { Image, TextInput, View } from "react-native"
import { PressableScale } from "pressto"
import ImageInput from "@/components/inputs/imageInput"
import { Ingredient as IngredientType } from "@/types/recipes"
import GlassOrBlurView from "@/components/glassOrBlurView"
import { X } from "lucide-react-native"
import useThemes from "@/hooks/themes/useThemes"
import { SHADOW_STYLE } from "@/lib/constants"

type Props = {
    ingredient: IngredientType
    index: number
    onUpdate: (index: number, field: keyof IngredientType, value: any) => void
    onRemove: (index: number) => void
}

export default function Ingredient({ ingredient, index, onUpdate, onRemove }: Props) {
    const { vars, theme } = useThemes()

    return (
        <View
            style={{
                borderWidth: 1,
                borderColor: vars.secondaryBorderColor,
                borderRadius: 20,
                padding: 12,
                marginBottom: 12,
                backgroundColor: vars.secondaryBackgroundColor,
            }}
        >
            <View
                style={[
                    {
                        position: "absolute",
                        top: 8,
                        right: 8,
                        borderRadius: 100,
                        zIndex: 100,
                    },
                    SHADOW_STYLE,
                ]}
            >
                <GlassOrBlurView
                    borderColor={vars.secondaryBorderColor}
                    style={{
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <PressableScale onPress={() => onRemove(index)}>
                        <X size={16} color={vars.textColor} />
                    </PressableScale>
                </GlassOrBlurView>
            </View>

            <TextInput
                value={ingredient.product ?? ""}
                onChangeText={(val) => onUpdate(index, "product", val)}
                style={{
                    color: vars.textColor,
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderWidth: 1,
                    borderColor: vars.secondaryBorderColor,
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                }}
                placeholder="Type here..."
                keyboardAppearance={theme === "light" ? "light" : "dark"}
                placeholderTextColor="gray"
            />

            {ingredient.image ? (
                <View
                    style={{
                        position: "relative",
                        width: 100,
                        height: 100,
                        marginTop: 4,
                    }}
                >
                    <Image
                        source={{ uri: ingredient.image.uri }}
                        style={{ width: 100, height: 100, borderRadius: 12 }}
                    />
                    <View
                        style={[
                            {
                                position: "absolute",
                                top: -8,
                                right: -8,
                                borderRadius: 100,
                            },
                            SHADOW_STYLE,
                        ]}
                    >
                        <GlassOrBlurView
                            style={{
                                width: 24,
                                height: 24,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <PressableScale
                                onPress={() => {
                                    onUpdate(index, "image", undefined)
                                    onUpdate(index, "type", "text")
                                }}
                            >
                                <X size={16} color={vars.textColor} />
                            </PressableScale>
                        </GlassOrBlurView>
                    </View>
                </View>
            ) : (
                <ImageInput
                    type="recipe"
                    onPick={(_, asset) => {
                        onUpdate(index, "image", asset)
                        onUpdate(index, "type", "image")
                    }}
                />
            )}
        </View>
    )
}
