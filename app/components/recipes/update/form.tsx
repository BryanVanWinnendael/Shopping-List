import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native"
import { PressableScale } from "pressto"
import { useState } from "react"
import FormError from "@/components/native/formError"
import { X } from "lucide-react-native"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { useUpdateRecipeForm } from "@/hooks/recipes/useUpdateRecipeForm"
import { useUpdateRecipe } from "@/hooks/recipes/useUpdateRecipe"
import Ingredient from "@/components/recipes/update/ingredient"
import Instruction from "@/components/recipes/update/instruction"
import CustomSwitch from "@/components/customSwitch"
import ImageInput from "@/components/inputs/imageInput"
import MealTypeSegment from "@/components/recipes/mealTypeSegment"
import CountryInput from "@/components/recipes/countryInput"
import useThemes from "@/hooks/themes/useThemes"
import Toast from "react-native-toast-message"
import { delay } from "@/lib/utils"
import { Recipe } from "@/types/generated/models/recipe"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M, SHEET_CTA_HEIGHT } from "@/lib/theme"

type Props = {
    recipe: Recipe
    close: () => void
    updateRecipeDetails: (recipe: Recipe) => void
}

const SUBMIT_DELAY_MS = 2000

const parseNumericField = (value: string) => {
    if (value.trim() === "") return 0
    const parsed = Number(value)
    return Number.isNaN(parsed) ? 0 : parsed
}

export default function EditRecipeForm({ recipe, close, updateRecipeDetails }: Props) {
    const { vars, appearance } = useThemes()
    const { states: formStates, actions: formActions } = useUpdateRecipeForm(recipe)
    const { states: editStates, actions: editActions } = useUpdateRecipe()
    const [error, setError] = useState<string | null>(null)

    const updateRecipe = async () => {
        const mappedRequest = formActions.getUpdateRecipeRequest()

        if (!mappedRequest) {
            setError("Title cannot be empty")
            return
        }

        setError(null)
        editActions.setLoading(true)

        const response = await editActions.updateRecipe(mappedRequest, formStates.imagesToDelete)

        await delay(SUBMIT_DELAY_MS)

        editActions.setLoading(false)

        if (response) {
            Toast.show({
                type: "success",
                text1: "Recipe updated successfully",
            })

            updateRecipeDetails(response)
            close()
        } else {
            setError("Failed to update recipe. Please try again.")
        }
    }

    const dynamicInputStyle = [
        styles.input,
        {
            color: vars.textColor,
            backgroundColor: vars.backgroundColor,
            borderColor: vars.borderColor,
        },
    ]

    const dynamicLabelStyle = [styles.label, { color: vars.textColor }]

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
            >
                <View style={styles.titleSection}>
                    <Text style={dynamicLabelStyle}>
                        Title <Text style={styles.required}>*</Text>
                    </Text>

                    <TextInput
                        value={formStates.title}
                        onChangeText={formActions.setTitle}
                        style={dynamicInputStyle}
                        placeholder="Recipe title"
                        placeholderTextColor={vars.tertiaryTextColor}
                        keyboardAppearance={appearance}
                    />
                </View>

                <View style={styles.rowSection}>
                    <View style={styles.labelBlock}>
                        <Text style={dynamicLabelStyle}>Public</Text>

                        <Text style={[styles.hint, { color: vars.tertiaryTextColor }]}>
                            Make this recipe visible to others
                        </Text>
                    </View>

                    <CustomSwitch value={formStates.publicRecipe} onChange={formActions.setPublicRecipe} />
                </View>

                <View style={styles.section}>
                    <Text style={dynamicLabelStyle}>Banner</Text>

                    {formStates.banner ? (
                        <View style={styles.bannerContainer}>
                            <Image
                                source={{
                                    uri:
                                        typeof formStates.banner === "string"
                                            ? formStates.banner
                                            : formStates.banner.uri,
                                }}
                                style={styles.banner}
                            />

                            <View style={styles.bannerClose}>
                                <LiquidGlassView style={styles.closeGlass} isInteractive>
                                    <PressableScale
                                        onPress={() => formActions.setBannerImage(null, null)}
                                        style={styles.closeButton}
                                    >
                                        <X size={17} strokeWidth={2} color={vars.textColor} />
                                    </PressableScale>
                                </LiquidGlassView>
                            </View>
                        </View>
                    ) : (
                        <ImageInput type="recipe" onPick={formActions.setBannerImage} />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={dynamicLabelStyle}>Source URL</Text>

                    <TextInput
                        value={formStates.source}
                        onChangeText={formActions.setSource}
                        style={dynamicInputStyle}
                        placeholder="https://..."
                        placeholderTextColor={vars.tertiaryTextColor}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardAppearance={appearance}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={dynamicLabelStyle}>Meal Type</Text>

                    <MealTypeSegment value={formStates.mealType} onChange={formActions.setMealType} />
                </View>

                <View style={styles.section}>
                    <Text style={dynamicLabelStyle}>Country</Text>

                    <CountryInput value={formStates.countryObject} onChange={formActions.setCountryObject} />
                </View>

                <View style={styles.section}>
                    <Text style={dynamicLabelStyle}>Time</Text>

                    <TextInput
                        value={String(formStates.time)}
                        onChangeText={(value) => formActions.setTime(parseNumericField(value))}
                        keyboardType="numeric"
                        returnKeyType="done"
                        style={dynamicInputStyle}
                        placeholder="e.g. 45 minutes"
                        placeholderTextColor={vars.tertiaryTextColor}
                        keyboardAppearance={appearance}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={dynamicLabelStyle}>Persons</Text>

                    <TextInput
                        value={String(formStates.persons)}
                        onChangeText={(value) => formActions.setPersons(parseNumericField(value))}
                        keyboardType="numeric"
                        returnKeyType="done"
                        style={dynamicInputStyle}
                        placeholder="e.g. 4"
                        placeholderTextColor={vars.tertiaryTextColor}
                        keyboardAppearance={appearance}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={dynamicLabelStyle}>Ingredients</Text>

                    <View style={styles.stack}>
                        {formStates.ingredients.map((ingredient, i) => (
                            <Ingredient
                                key={i}
                                ingredient={ingredient}
                                index={i}
                                onUpdate={(index, field, value) =>
                                    formActions.updateIngredient(index, {
                                        [field]: value,
                                    })
                                }
                                onRemove={formActions.deleteIngredient}
                                onRemoveImage={formActions.deleteIngredientImage}
                            />
                        ))}
                    </View>

                    <PressableScale
                        onPress={formActions.createIngredient}
                        style={[
                            styles.addButton,
                            {
                                backgroundColor: vars.backgroundColor,
                                borderColor: vars.borderColor,
                            },
                        ]}
                    >
                        <Text style={[styles.addButtonText, { color: vars.textColor }]}>+ Add Ingredient</Text>
                    </PressableScale>
                </View>

                <View style={styles.section}>
                    <Text style={dynamicLabelStyle}>Instructions</Text>

                    <View style={styles.stack}>
                        {formStates.instructions.map((instruction, i) => (
                            <Instruction
                                key={i}
                                instruction={instruction}
                                index={i}
                                onUpdate={(index, value) => formActions.updateInstruction(index, value)}
                                onRemove={formActions.deleteInstruction}
                            />
                        ))}
                    </View>

                    <PressableScale
                        onPress={formActions.createInstruction}
                        style={[
                            styles.addButton,
                            {
                                backgroundColor: vars.backgroundColor,
                                borderColor: vars.borderColor,
                            },
                        ]}
                    >
                        <Text style={[styles.addButtonText, { color: vars.textColor }]}>+ Add Instruction</Text>
                    </PressableScale>
                </View>
            </ScrollView>

            <View style={styles.updateButtonContainer}>
                <FormError message={error} onDismiss={() => setError(null)} />
                <LiquidGlassView style={styles.updateGlass} isInteractive={!editStates.loading}>
                    <PressableScale
                        enabled={!editStates.loading}
                        onPress={updateRecipe}
                        style={[styles.updateButton, { backgroundColor: `${vars.accentColor}E6` }]}
                    >
                        {editStates.loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.updateButtonText}>Update Recipe</Text>
                        )}
                    </PressableScale>
                </LiquidGlassView>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 64,
        paddingBottom: 80,
    },
    titleSection: {
        marginBottom: 22,
    },
    section: {
        marginBottom: 24,
    },
    rowSection: {
        minHeight: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    labelBlock: {
        flex: 1,
        marginRight: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS_M,
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 16,
    },
    label: {
        fontWeight: "600",
        fontSize: 15,
        marginBottom: 9,
    },
    required: {
        color: "#AA4A44",
    },
    hint: {
        fontSize: 13,
        marginTop: -5,
    },
    stack: {
        gap: 10,
    },
    bannerContainer: {
        position: "relative",
        width: 140,
        height: 140,
    },
    banner: {
        width: 140,
        height: 140,
        borderRadius: BORDER_RADIUS_M,
    },
    bannerClose: {
        position: "absolute",
        top: -8,
        right: -8,
        zIndex: 1,
    },
    closeGlass: {
        width: 28,
        height: 28,
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
    closeButton: {
        width: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
    },
    addButton: {
        marginTop: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS_L,
        alignItems: "center",
    },
    addButtonText: {
        fontWeight: "600",
    },
    updateButtonContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "transparent",
    },
    updateGlass: {
        minHeight: SHEET_CTA_HEIGHT,
        borderRadius: BORDER_RADIUS_L,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    updateButton: {
        minHeight: SHEET_CTA_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
    },
    updateButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
})
