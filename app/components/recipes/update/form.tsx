import { ActivityIndicator, Image, ScrollView, Text, TextInput, View } from "react-native"
import { PressableScale } from "pressto"
import { Recipe } from "@/types/recipes"
import { useUpdateRecipeForm } from "@/hooks/recipes/useUpdateRecipeForm"
import { useUpdateRecipe } from "@/hooks/recipes/useUpdateRecipe"
import Ingredient from "@/components/recipes/update/ingredient"
import { X } from "lucide-react-native"
import CustomSwitch from "@/components/customSwitch"
import { useRecipesStore } from "@/stores/useRecipesStore"
import ImageInput from "@/components/inputs/imageInput"
import MealTypeSegment from "@/components/recipes/mealTypeSegment"
import CountryInput from "@/components/recipes/countryInput"
import useThemes from "@/hooks/themes/useThemes"
import Toast from "react-native-toast-message"
import Instruction from "@/components/recipes/update/instruction"
import { delay } from "@/lib/utils"
import GlassOrBlurView from "@/components/glassOrBlurView"

type Props = {
    recipe: Recipe
    close: () => void
    updateRecipeDetails: (recipe: Recipe) => void
}

export default function EditRecipeForm({ recipe, close, updateRecipeDetails }: Props) {
    const { vars, theme } = useThemes()
    const { updateRecipe: updateRecipeStore } = useRecipesStore()
    const { states: formStates, actions: formActions } = useUpdateRecipeForm(recipe)
    const { states: editStates, actions: editActions } = useUpdateRecipe()

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
            updateRecipeStore(response)
            updateRecipeDetails(response)
        } else {
            Toast.show({
                type: "error",
                text1: "Failed to update Recipe",
            })
        }

        close()
    }

    return (
        <>
            <ScrollView style={{ height: 560 }} showsVerticalScrollIndicator={false}>
                <View style={{ paddingBottom: 20 }}>
                    <FieldLabel label="Title" required textColor={vars.textColor} />
                    <StyledInput
                        value={formStates.title}
                        onChangeText={formActions.setTitle}
                        placeholder="Recipe title"
                        borderColor={vars.secondaryBorderColor}
                        backgroundColor={vars.secondaryBackgroundColor}
                        textColor={vars.textColor}
                    />

                    <FieldLabel label="Public" textColor={vars.textColor} />
                    <CustomSwitch value={formStates.publicRecipe} onChange={formActions.setPublicRecipe} />

                    <FieldLabel label="Banner" textColor={vars.textColor} />
                    {formStates.banner ? (
                        <View style={{ position: "relative", width: 120, height: 120 }}>
                            <Image
                                source={{
                                    uri:
                                        typeof formStates.banner === "string"
                                            ? formStates.banner
                                            : formStates.banner.uri,
                                }}
                                style={{ width: 120, height: 120, borderRadius: 12 }}
                            />
                            <GlassOrBlurView
                                style={{
                                    position: "absolute",
                                    top: -8,
                                    right: -8,
                                    borderRadius: 24,
                                    width: 24,
                                    height: 24,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <PressableScale onPress={() => formActions.setBannerImage(null, null)}>
                                    <X size={16} color={vars.textColor} />
                                </PressableScale>
                            </GlassOrBlurView>
                        </View>
                    ) : (
                        <ImageInput type="recipe" onPick={formActions.setBannerImage} />
                    )}

                    <FieldLabel label="Source URL" textColor={vars.textColor} />
                    <StyledInput
                        theme={theme}
                        value={formStates.source}
                        onChangeText={formActions.setSource}
                        placeholder="https://..."
                        borderColor={vars.secondaryBorderColor}
                        backgroundColor={vars.secondaryBackgroundColor}
                        textColor={vars.textColor}
                    />

                    <FieldLabel label="Meal Type" textColor={vars.textColor} />
                    <MealTypeSegment value={formStates.mealType} onChange={formActions.setMealType} />

                    <FieldLabel label="Country" textColor={vars.textColor} />
                    <CountryInput value={formStates.countryObject} onChange={formActions.setCountryObject} />

                    <FieldLabel label="Time (minutes)" textColor={vars.textColor} />
                    <StyledInput
                        theme={theme}
                        value={String(formStates.time)}
                        onChangeText={(v: string) => formActions.setTime(Number(v))}
                        placeholder="e.g. 45"
                        keyboardType="numeric"
                        borderColor={vars.secondaryBorderColor}
                        backgroundColor={vars.secondaryBackgroundColor}
                        textColor={vars.textColor}
                        returnKeyType="done"
                    />

                    <FieldLabel label="Persons" textColor={vars.textColor} />
                    <StyledInput
                        theme={theme}
                        value={String(formStates.persons)}
                        onChangeText={(v: string) => formActions.setPersons(Number(v))}
                        placeholder="e.g. 4"
                        keyboardType="numeric"
                        borderColor={vars.secondaryBorderColor}
                        backgroundColor={vars.secondaryBackgroundColor}
                        textColor={vars.textColor}
                        returnKeyType="done"
                    />

                    <FieldLabel label="Ingredients" textColor={vars.textColor} />
                    {formStates.ingredients.map((ingredient, index) => (
                        <Ingredient
                            key={index}
                            ingredient={ingredient}
                            index={index}
                            onUpdate={(i, field, value) => formActions.updateIngredient(i, { [field]: value })}
                            onRemove={formActions.deleteIngredient}
                            onRemoveImage={formActions.deleteIngredientImage}
                        />
                    ))}

                    <PressableScale
                        onPress={formActions.createIngredient}
                        style={{
                            backgroundColor: vars.backgroundColor,
                            padding: 10,
                            borderWidth: 1,
                            borderColor: vars.borderColor,
                            borderRadius: 24,
                            marginTop: 8,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: vars.textColor, fontWeight: "600" }}>+ Add Ingredient</Text>
                    </PressableScale>

                    <FieldLabel label="Instructions" textColor={vars.textColor} />
                    {formStates.instructions.map((instruction, index) => (
                        <Instruction
                            key={index}
                            instruction={instruction}
                            index={index}
                            onUpdate={(i, value) => formActions.updateInstruction(i, value)}
                            onRemove={formActions.deleteInstruction}
                        />
                    ))}
                    <PressableScale
                        onPress={formActions.createInstruction}
                        style={{
                            backgroundColor: vars.backgroundColor,
                            padding: 10,
                            borderWidth: 1,
                            borderColor: vars.borderColor,
                            borderRadius: 24,
                            marginTop: 8,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: vars.textColor, fontWeight: "600" }}>+ Add Instruction</Text>
                    </PressableScale>
                </View>
            </ScrollView>

            <PressableScale
                enabled={!editStates.loading}
                onPress={updateRecipe}
                style={{
                    backgroundColor: vars.accentColor,
                    padding: 14,
                    borderRadius: 24,
                    alignItems: "center",
                    marginTop: 16,
                }}
            >
                {editStates.loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Update Recipe</Text>
                )}
            </PressableScale>
        </>
    )
}

function FieldLabel({ textColor, label, required = false }: any) {
    return (
        <Text
            style={{
                color: textColor,
                fontWeight: "600",
                marginTop: 12,
                marginBottom: 6,
            }}
        >
            {label} {required && <Text style={{ color: "#AA4A44" }}>*</Text>}
        </Text>
    )
}

function StyledInput({ textColor, backgroundColor, borderColor, theme, ...props }: any) {
    return (
        <TextInput
            keyboardAppearance={theme === "light" ? "light" : "dark"}
            {...props}
            style={{
                color: textColor,
                backgroundColor: backgroundColor,
                borderWidth: 1,
                borderColor: borderColor,
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: 8,
            }}
            placeholderTextColor="#aaa"
        />
    )
}
