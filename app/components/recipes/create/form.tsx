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
import { useCreateRecipeForm } from "@/hooks/recipes/useCreateRecipeForm"
import Ingredient from "@/components/recipes/create/ingredient"
import { useCreateRecipe } from "@/hooks/recipes/useCreateRecipe"
import CustomSwitch from "@/components/customSwitch"
import { X } from "lucide-react-native"
import ImageInput from "@/components/inputs/imageInput"
import MealTypeSegment from "@/components/recipes/mealTypeSegment"
import CountryInput from "@/components/recipes/countryInput"
import useThemes from "@/hooks/themes/useThemes"
import Toast from "react-native-toast-message"
import Instruction from "@/components/recipes/create/instruction"
import { delay } from "@/lib/utils"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M, SHEET_CTA_HEIGHT } from "@/lib/theme"

type Props = {
    onClose: () => void
}

const SUBMIT_DELAY_MS = 2000

const parseNumericField = (value: string) => {
    if (value.trim() === "") return 0
    const parsed = Number(value)
    return Number.isNaN(parsed) ? 0 : parsed
}

export default function Form({ onClose }: Props) {
    const { vars, appearance } = useThemes()
    const { actions: addRecipeActions, states: addRecipeStates } = useCreateRecipe()
    const { actions: addRecipeFormActions, states: addRecipeFormStates } = useCreateRecipeForm()
    const [error, setError] = useState<string | null>(null)

    const createRecipe = async () => {
        const createRecipeRequest = addRecipeFormActions.getCreateRecipeRequest()

        if (!createRecipeRequest) {
            setError("Title cannot be empty")
            return
        }

        setError(null)
        addRecipeActions.setLoading(true)

        const response = await addRecipeActions.createRecipe(createRecipeRequest)

        await delay(SUBMIT_DELAY_MS)

        addRecipeActions.setLoading(false)

        if (response) {
            Toast.show({
                type: "success",
                text1: "Recipe created successfully",
            })

            addRecipeFormActions.reset()
            onClose()
        } else {
            setError("Failed to create recipe. Please try again.")
        }
    }

    const dynamicInputStyle = [
        styles.input,
        {
            color: vars.textColor,
            backgroundColor: vars.secondaryBackgroundColor,
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
                        value={addRecipeFormStates.title}
                        onChangeText={addRecipeFormActions.setTitle}
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

                    <CustomSwitch
                        value={addRecipeFormStates.publicRecipe}
                        onChange={addRecipeFormActions.setPublicRecipe}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={dynamicLabelStyle}>Banner</Text>

                    {addRecipeFormStates.banner ? (
                        <View style={styles.bannerContainer}>
                            <Image
                                source={{
                                    uri: addRecipeFormStates.banner,
                                }}
                                style={styles.banner}
                            />

                            <View style={styles.bannerClose}>
                                <LiquidGlassView style={styles.closeGlass} isInteractive>
                                    <PressableScale
                                        onPress={() => addRecipeFormActions.setBannerImage(null, null)}
                                        style={styles.closeButton}
                                    >
                                        <X size={17} strokeWidth={2} color={vars.textColor} />
                                    </PressableScale>
                                </LiquidGlassView>
                            </View>
                        </View>
                    ) : (
                        <ImageInput type="recipe" onPick={addRecipeFormActions.setBannerImage} />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={dynamicLabelStyle}>Source URL</Text>

                    <TextInput
                        value={addRecipeFormStates.source}
                        onChangeText={addRecipeFormActions.setSource}
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

                    <MealTypeSegment value={addRecipeFormStates.mealType} onChange={addRecipeFormActions.setMealType} />
                </View>

                <View style={styles.section}>
                    <Text style={dynamicLabelStyle}>Country</Text>

                    <CountryInput
                        value={addRecipeFormStates.countryObject}
                        onChange={addRecipeFormActions.setCountryObject}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={dynamicLabelStyle}>Time</Text>

                    <TextInput
                        value={String(addRecipeFormStates.time)}
                        onChangeText={(value) => addRecipeFormActions.setTime(parseNumericField(value))}
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
                        value={String(addRecipeFormStates.persons)}
                        onChangeText={(value) => addRecipeFormActions.setPersons(parseNumericField(value))}
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
                        {addRecipeFormStates.ingredients.map((ingredient, i) => (
                            <Ingredient
                                key={i}
                                ingredient={ingredient}
                                index={i}
                                onUpdate={addRecipeFormActions.updateIngredient}
                                onRemove={addRecipeFormActions.removeIngredient}
                            />
                        ))}
                    </View>

                    <PressableScale
                        onPress={addRecipeFormActions.addIngredient}
                        style={[
                            styles.addButton,
                            {
                                backgroundColor: vars.secondaryBackgroundColor,
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
                        {addRecipeFormStates.instructions.map((instruction, i) => (
                            <Instruction
                                key={i}
                                instruction={instruction}
                                index={i}
                                onUpdate={addRecipeFormActions.updateInstruction}
                                onRemove={addRecipeFormActions.removeInstruction}
                            />
                        ))}
                    </View>

                    <PressableScale
                        onPress={addRecipeFormActions.addInstruction}
                        style={[
                            styles.addButton,
                            {
                                backgroundColor: vars.secondaryBackgroundColor,
                                borderColor: vars.borderColor,
                            },
                        ]}
                    >
                        <Text style={[styles.addButtonText, { color: vars.textColor }]}>+ Add Instruction</Text>
                    </PressableScale>
                </View>
            </ScrollView>

            <View style={styles.createButtonContainer}>
                <FormError message={error} onDismiss={() => setError(null)} />
                <LiquidGlassView style={styles.createGlass} isInteractive={!addRecipeStates.loading}>
                    <PressableScale
                        enabled={!addRecipeStates.loading}
                        onPress={createRecipe}
                        style={[styles.createButton, { backgroundColor: `${vars.accentColor}E6` }]}
                    >
                        {addRecipeStates.loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.createButtonText}>Create Recipe</Text>
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
    createButtonContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "transparent",
    },
    createGlass: {
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
    createButton: {
        minHeight: SHEET_CTA_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
    },
    createButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
})
