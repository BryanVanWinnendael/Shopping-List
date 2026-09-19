import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native"
import { PressableScale } from "pressto"
import { X } from "lucide-react-native"
import { GlassView } from "expo-glass-effect"

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
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    recipe: Recipe
    close: () => void
    updateRecipeDetails: (recipe: Recipe) => void
}

export default function EditRecipeForm({ recipe, close, updateRecipeDetails }: Props) {
    const { vars, theme } = useThemes()
    const { states: formStates, actions: formActions } = useUpdateRecipeForm(recipe)
    const { states: editStates, actions: editActions } = useUpdateRecipe()

    const colorScheme = theme === "light" ? "light" : "dark"

    const updateRecipe = async () => {
        const mappedRequest = formActions.getUpdateRecipeRequest()

        if (!mappedRequest) {
            Toast.show({
                type: "error",
                text1: "Error: Title cannot be empty",
            })
            return
        }

        Toast.show({
            type: "success",
            text1: "Updating Recipe...",
            autoHide: false,
        })

        editActions.setLoading(true)

        const response = await editActions.updateRecipe(mappedRequest, formStates.imagesToDelete)

        await delay(2000)

        editActions.setLoading(false)

        if (response) {
            Toast.show({
                type: "success",
                text1: "Recipe updated successfully",
            })

            updateRecipeDetails(response)
        } else {
            Toast.show({
                type: "error",
                text1: "Failed to update Recipe",
            })
        }

        close()
    }

    const inputStyle = {
        color: vars.textColor,
        backgroundColor: vars.secondaryBackgroundColor,
        borderWidth: 1,
        borderColor: vars.secondaryBorderColor,
        borderRadius: BORDER_RADIUS_M,
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 16,
    }

    const labelStyle = {
        color: vars.textColor,
        fontWeight: "600" as const,
        fontSize: 15,
        marginBottom: 9,
    }

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
                    <Text style={labelStyle}>
                        Title <Text style={{ color: "#AA4A44" }}>*</Text>
                    </Text>

                    <TextInput
                        value={formStates.title}
                        onChangeText={formActions.setTitle}
                        style={inputStyle}
                        placeholder="Recipe title"
                        placeholderTextColor="gray"
                        keyboardAppearance={theme === "light" ? "light" : "dark"}
                    />
                </View>

                {/* Public */}
                <View style={styles.rowSection}>
                    <View style={styles.labelBlock}>
                        <Text style={labelStyle}>Public</Text>

                        <Text
                            style={{
                                color: theme === "light" ? "#6b7280" : "#8b9199",
                                fontSize: 13,
                                marginTop: -5,
                            }}
                        >
                            Make this recipe visible to others
                        </Text>
                    </View>

                    <CustomSwitch value={formStates.publicRecipe} onChange={formActions.setPublicRecipe} />
                </View>

                {/* Banner */}
                <View style={styles.section}>
                    <Text style={labelStyle}>Banner</Text>

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
                                <GlassView
                                    glassEffectStyle="regular"
                                    isInteractive
                                    colorScheme={colorScheme}
                                    style={styles.closeGlass}
                                >
                                    <PressableScale
                                        onPress={() => formActions.setBannerImage(null, null)}
                                        style={styles.closeButton}
                                    >
                                        <X size={17} strokeWidth={2} color={vars.textColor} />
                                    </PressableScale>
                                </GlassView>
                            </View>
                        </View>
                    ) : (
                        <ImageInput type="recipe" onPick={formActions.setBannerImage} />
                    )}
                </View>

                {/* Source */}
                <View style={styles.section}>
                    <Text style={labelStyle}>Source URL</Text>

                    <TextInput
                        value={formStates.source}
                        onChangeText={formActions.setSource}
                        style={inputStyle}
                        placeholder="https://..."
                        placeholderTextColor="gray"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardAppearance={theme === "light" ? "light" : "dark"}
                    />
                </View>

                {/* Meal Type */}
                <View style={styles.section}>
                    <Text style={labelStyle}>Meal Type</Text>

                    <MealTypeSegment value={formStates.mealType} onChange={formActions.setMealType} />
                </View>

                {/* Country */}
                <View style={styles.section}>
                    <Text style={labelStyle}>Country</Text>

                    <CountryInput value={formStates.countryObject} onChange={formActions.setCountryObject} />
                </View>

                {/* Time */}
                <View style={styles.section}>
                    <Text style={labelStyle}>Time</Text>

                    <TextInput
                        value={String(formStates.time)}
                        onChangeText={(value) => formActions.setTime(Number(value))}
                        keyboardType="numeric"
                        returnKeyType="done"
                        style={inputStyle}
                        placeholder="e.g. 45 minutes"
                        placeholderTextColor="gray"
                        keyboardAppearance={theme === "light" ? "light" : "dark"}
                    />
                </View>

                {/* Persons */}
                <View style={styles.section}>
                    <Text style={labelStyle}>Persons</Text>

                    <TextInput
                        value={String(formStates.persons)}
                        onChangeText={(value) => formActions.setPersons(Number(value))}
                        keyboardType="numeric"
                        returnKeyType="done"
                        style={inputStyle}
                        placeholder="e.g. 4"
                        placeholderTextColor="gray"
                        keyboardAppearance={theme === "light" ? "light" : "dark"}
                    />
                </View>

                {/* Ingredients */}
                <View style={styles.section}>
                    <Text style={labelStyle}>Ingredients</Text>

                    <View style={{ gap: 10 }}>
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
                                backgroundColor: vars.secondaryBackgroundColor,
                                borderColor: vars.secondaryBorderColor,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                            }}
                        >
                            + Add Ingredient
                        </Text>
                    </PressableScale>
                </View>

                <View style={styles.section}>
                    <Text style={labelStyle}>Instructions</Text>

                    <View style={{ gap: 10 }}>
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
                                backgroundColor: vars.secondaryBackgroundColor,
                                borderColor: vars.secondaryBorderColor,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                            }}
                        >
                            + Add Instruction
                        </Text>
                    </PressableScale>
                </View>
            </ScrollView>

            <View style={styles.updateButtonContainer}>
                <GlassView
                    glassEffectStyle="regular"
                    isInteractive={!editStates.loading}
                    colorScheme={colorScheme}
                    tintColor={vars.accentColor}
                    style={styles.updateGlass}
                >
                    <PressableScale
                        enabled={!editStates.loading}
                        onPress={updateRecipe}
                        style={[
                            styles.updateButton,
                            {
                                backgroundColor: `${vars.accentColor}E6`,
                            },
                        ]}
                    >
                        {editStates.loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.updateButtonText}>Update Recipe</Text>
                        )}
                    </PressableScale>
                </GlassView>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = {
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
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
        marginBottom: 24,
    },

    labelBlock: {
        flex: 1,
        marginRight: 16,
    },

    bannerContainer: {
        position: "relative" as const,
        width: 140,
        height: 140,
    },
    banner: {
        width: 140,
        height: 140,
        borderRadius: BORDER_RADIUS_M,
    },
    bannerClose: {
        position: "absolute" as const,
        top: -8,
        right: -8,
        zIndex: 1,
    },
    closeGlass: {
        width: 28,
        height: 28,
        borderRadius: BORDER_RADIUS_FULL,
        justifyContent: "center" as const,
        alignItems: "center" as const,
        overflow: "hidden" as const,
    },
    closeButton: {
        width: 28,
        height: 28,
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    addButton: {
        marginTop: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS_L,
        alignItems: "center" as const,
    },
    updateButtonContainer: {
        position: "absolute" as const,
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "transparent",
    },
    updateGlass: {
        minHeight: 54,
        borderRadius: BORDER_RADIUS_L,
        overflow: "hidden" as const,
    },
    updateButton: {
        minHeight: 54,
        alignItems: "center" as const,
        justifyContent: "center" as const,
    },
    updateButtonText: {
        color: "#fff",
        fontWeight: "700" as const,
        fontSize: 16,
    },
}
