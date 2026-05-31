import { Image, TextInput, View } from "react-native"
import { Ingredient as IngredientType } from "@/types/recipes"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { PressableScale } from "pressto"
import { X } from "lucide-react-native"
import ImageInput from "@/components/inputs/imageInput"

type Props = {
    ingredient: IngredientType
    index: number
    onUpdate: (index: number, field: keyof IngredientType, value: any) => void
    onRemove: (index: number) => void
    onRemoveImage: (index: number) => void
}

export default function Ingredient({ ingredient, index, onUpdate, onRemove, onRemoveImage }: Props) {
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
            <GlassOrBlurView
                borderColor={vars.secondaryBorderColor}
                style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10,
                }}
            >
                <PressableScale onPress={() => onRemove(index)}>
                    <X size={16} color={vars.textColor} />
                </PressableScale>
            </GlassOrBlurView>

            <TextInput
                value={ingredient.product ?? ""}
                onChangeText={(val) => onUpdate(index, "product", val)}
                style={{
                    color: vars.textColor,
                    backgroundColor: vars.secondaryBackgroundColor,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: vars.secondaryBorderColor,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                }}
                placeholder="Type here..."
                keyboardAppearance={theme === "light" ? "light" : "dark"}
                placeholderTextColor="#aaa"
            />

            {ingredient.url || ingredient.image ? (
                <View
                    style={{
                        position: "relative",
                        width: 100,
                        height: 100,
                        marginTop: 4,
                    }}
                >
                    <Image
                        source={{ uri: ingredient.url ?? ingredient.image?.uri }}
                        style={{ width: 100, height: 100, borderRadius: 12 }}
                    />
                    <GlassOrBlurView
                        style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            borderRadius: 50,
                            width: 24,
                            height: 24,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <PressableScale onPress={() => onRemoveImage(index)}>
                            <X size={16} color={vars.textColor} />
                        </PressableScale>
                    </GlassOrBlurView>
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
