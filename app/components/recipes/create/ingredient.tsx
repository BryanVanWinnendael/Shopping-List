import { Image, StyleSheet, Text, TextInput, View } from "react-native"
import { Ingredient as IngredientType } from "@/types/recipes"
import LiquidGlassView from "@/components/native/liquidGlassView"
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
    const { vars, appearance } = useThemes()

    return (
        <LiquidGlassView style={styles.card}>
            <View style={styles.removeWrapper}>
                <LiquidGlassView style={styles.removeGlass} isInteractive>
                    <PressableScale onPress={() => onRemove(index)} style={styles.removeButton}>
                        <X size={15} strokeWidth={2} color={vars.textColor} />
                    </PressableScale>
                </LiquidGlassView>
            </View>

            <TextInput
                value={ingredient.product ?? ""}
                onChangeText={(value) => onUpdate(index, "product", value)}
                placeholder="Ingredient"
                placeholderTextColor={vars.tertiaryTextColor}
                returnKeyType="done"
                keyboardAppearance={appearance}
                style={[
                    styles.productInput,
                    {
                        backgroundColor: vars.backgroundColor,
                        borderColor: vars.borderColor,
                        color: vars.textColor,
                    },
                ]}
            />

            {ingredient.image ? (
                <View style={[styles.imageWrapper, { backgroundColor: vars.backgroundColor }]}>
                    <Image
                        source={{
                            uri: ingredient.image.uri,
                        }}
                        style={styles.image}
                        resizeMode="contain"
                    />

                    <View style={styles.imageRemoveWrapper}>
                        <LiquidGlassView style={styles.removeGlass} isInteractive>
                            <PressableScale
                                onPress={() => {
                                    onUpdate(index, "image", undefined)
                                    onUpdate(index, "type", "text")
                                }}
                                style={styles.removeButton}
                            >
                                <X size={15} strokeWidth={2} color={vars.textColor} />
                            </PressableScale>
                        </LiquidGlassView>
                    </View>
                </View>
            ) : (
                <View
                    style={[
                        styles.emptyImage,
                        {
                            borderColor: vars.secondaryBorderColor,
                            backgroundColor: vars.secondaryBackgroundColor,
                        },
                    ]}
                >
                    <View style={[styles.emptyIcon, { backgroundColor: vars.backgroundColor }]}>
                        <ImagePlus size={18} color={vars.textColor} strokeWidth={1.8} />
                    </View>

                    <View style={styles.emptyTextBlock}>
                        <Text style={[styles.emptyTitle, { color: vars.textColor }]}>Add Image</Text>
                        <Text style={[styles.emptySubtitle, { color: vars.tertiaryTextColor }]}>Optional</Text>
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
        </LiquidGlassView>
    )
}

const styles = StyleSheet.create({
    card: {
        position: "relative",
        borderRadius: BORDER_RADIUS_L,
        borderWidth: 1,
        padding: 12,
        marginBottom: 12,
        overflow: "visible",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    removeWrapper: {
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 10,
    },
    removeGlass: {
        width: 30,
        height: 30,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    removeButton: {
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    productInput: {
        height: 46,
        paddingHorizontal: 14,
        paddingRight: 44,
        marginBottom: 10,
        borderRadius: BORDER_RADIUS_M,
        borderWidth: 1,
        fontSize: 16,
    },
    imageWrapper: {
        width: "100%",
        maxHeight: 300,
        borderRadius: BORDER_RADIUS_M,
        overflow: "hidden",
        position: "relative",
    },
    image: {
        width: "100%",
        height: 220,
    },
    imageRemoveWrapper: {
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 5,
    },
    emptyImage: {
        height: 72,
        borderRadius: BORDER_RADIUS_M,
        borderWidth: 1,
        overflow: "visible",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        position: "relative",
        zIndex: 1000,
    },
    emptyIcon: {
        width: 38,
        height: 38,
        borderRadius: BORDER_RADIUS_M,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 11,
    },
    emptyTextBlock: {
        flex: 1,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: "500",
    },
    emptySubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
})
