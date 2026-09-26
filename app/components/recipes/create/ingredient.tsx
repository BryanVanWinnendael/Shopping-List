import { Image, Text, TextInput, View } from "react-native"
import { Ingredient as IngredientType } from "@/types/recipes"
import { GlassView } from "expo-glass-effect"
import useThemes from "@/hooks/themes/useThemes"
import { PressableScale } from "pressto"
import { ImagePlus, X } from "lucide-react-native"
import ImageInput from "@/components/inputs/imageInput"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    ingredient: IngredientType
    index: number
    onUpdate: (index: number, field: keyof IngredientType, value: any) => void
    onRemove: (index: number) => void
}

export default function Ingredient({ ingredient, index, onUpdate, onRemove }: Props) {
    const { vars, theme } = useThemes()

    const colorScheme = theme === "light" ? "light" : "dark"

    return (
        <GlassView
            glassEffectStyle="regular"
            colorScheme={colorScheme}
            style={{
                position: "relative",
                borderRadius: BORDER_RADIUS_L,
                padding: 12,
                marginBottom: 12,
                overflow: "visible",
            }}
        >
            <View
                style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 10,
                }}
            >
                <GlassView
                    glassEffectStyle="regular"
                    isInteractive
                    colorScheme={colorScheme}
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: BORDER_RADIUS_FULL,
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                    }}
                >
                    <PressableScale
                        onPress={() => onRemove(index)}
                        style={{
                            width: 30,
                            height: 30,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <X size={15} strokeWidth={2} color={vars.textColor} />
                    </PressableScale>
                </GlassView>
            </View>

            <TextInput
                value={ingredient.product ?? ""}
                onChangeText={(value) => onUpdate(index, "product", value)}
                placeholder="Ingredient"
                placeholderTextColor="gray"
                returnKeyType="done"
                keyboardAppearance={theme === "light" ? "light" : "dark"}
                style={{
                    height: 46,
                    paddingHorizontal: 14,
                    paddingRight: 44,
                    marginBottom: 10,
                    borderRadius: BORDER_RADIUS_M,
                    backgroundColor: vars.backgroundColor,
                    borderWidth: 1,
                    borderColor: vars.secondaryBorderColor,
                    color: vars.textColor,
                    fontSize: 16,
                }}
            />

            {ingredient.image ? (
                <View
                    style={{
                        width: "100%",
                        maxHeight: 300,
                        borderRadius: BORDER_RADIUS_M,
                        overflow: "hidden",
                        position: "relative",
                        backgroundColor: vars.backgroundColor,
                    }}
                >
                    <Image
                        source={{
                            uri: ingredient.image.uri,
                        }}
                        style={{
                            width: "100%",
                            height: 220,
                        }}
                        resizeMode="contain"
                    />

                    <View
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 5,
                        }}
                    >
                        <GlassView
                            glassEffectStyle="regular"
                            isInteractive
                            colorScheme={colorScheme}
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: BORDER_RADIUS_FULL,
                                justifyContent: "center",
                                alignItems: "center",
                                overflow: "hidden",
                            }}
                        >
                            <PressableScale
                                onPress={() => {
                                    onUpdate(index, "image", undefined)
                                    onUpdate(index, "type", "text")
                                }}
                                style={{
                                    width: 30,
                                    height: 30,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <X size={15} strokeWidth={2} color={vars.textColor} />
                            </PressableScale>
                        </GlassView>
                    </View>
                </View>
            ) : (
                <View
                    style={{
                        height: 72,
                        borderRadius: BORDER_RADIUS_M,
                        borderWidth: 1,
                        borderColor: vars.secondaryBorderColor,
                        backgroundColor: vars.backgroundColor,
                        overflow: "visible",
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 14,
                        position: "relative",
                        zIndex: 1000,
                    }}
                >
                    <View
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: BORDER_RADIUS_M,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: vars.secondaryBackgroundColor,
                            marginRight: 11,
                        }}
                    >
                        <ImagePlus size={18} color={vars.textColor} strokeWidth={1.8} />
                    </View>

                    <View
                        style={{
                            flex: 1,
                        }}
                    >
                        <Text
                            style={{
                                color: vars.textColor,
                                fontSize: 15,
                                fontWeight: "500",
                            }}
                        >
                            Add Image
                        </Text>

                        <Text
                            style={{
                                color: "gray",
                                fontSize: 12,
                                marginTop: 2,
                            }}
                        >
                            Optional
                        </Text>
                    </View>

                    <ImageInput
                        type="recipe"
                        onPick={(_, asset) => {
                            onUpdate(index, "image", asset)
                            onUpdate(index, "type", "image")
                        }}
                    />
                </View>
            )}
        </GlassView>
    )
}
