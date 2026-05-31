import { ActivityIndicator, Image, ScrollView, Text, TextInput, View } from "react-native"
import { PressableScale } from "pressto"
import { useCreateRecipeForm } from "@/hooks/recipes/useCreateRecipeForm"
import Ingredient from "@/components/recipes/create/ingredient"
import { useCreateRecipe } from "@/hooks/recipes/useCreateRecipe"
import CustomSwitch from "@/components/customSwitch"
import { X } from "lucide-react-native"
import GlassOrBlurView from "@/components/glassOrBlurView"
import ImageInput from "@/components/inputs/imageInput"
import MealTypeSegment from "@/components/recipes/mealTypeSegment"
import CountryInput from "@/components/recipes/countryInput"
import useThemes from "@/hooks/themes/useThemes"
import Toast from "react-native-toast-message"
import Instruction from "@/components/recipes/create/instruction"
import { delay } from "@/lib/utils"

type Props = {
    onClose: () => void
}

export default function Form({ onClose }: Props) {
    const { vars, theme } = useThemes()
    const { actions: addRecipeActions, states: addRecipeStates } = useCreateRecipe()
    const { actions: addRecipeFormActions, states: addRecipeFormStates } = useCreateRecipeForm()

    const createRecipe = async () => {
        const createRecipeRequest = addRecipeFormActions.getCreateRecipeRequest()
        if (!createRecipeRequest) {
            Toast.show({
                type: "error",
                text1: "Error: Title cannot be empty",
            })
            return
        }

        Toast.show({
            type: "success",
            text1: "Creating Recipe...",
            autoHide: false,
        })
        addRecipeActions.setLoading(true)

        const response = await addRecipeActions.createRecipe(createRecipeRequest)

        await delay(2000)

        addRecipeActions.setLoading(false)

        if (response) {
            Toast.show({
                type: "success",
                text1: "Recipe created successfully",
            })
            addRecipeFormActions.reset()
            onClose()
        } else {
            Toast.show({
                type: "error",
                text1: "Failed to create Recipe",
            })
        }
    }

    return (
        <>
            <ScrollView style={{ height: 560 }} showsVerticalScrollIndicator={false}>
                <View style={{ gap: 12 }}>
                    <View style={{ marginBottom: 12 }}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                                marginBottom: 8,
                            }}
                        >
                            Title <Text style={{ color: "#AA4A44" }}>*</Text>
                        </Text>
                        <TextInput
                            value={addRecipeFormStates.title}
                            onChangeText={addRecipeFormActions.setTitle}
                            style={{
                                color: vars.textColor,
                                backgroundColor: vars.secondaryBackgroundColor,
                                borderWidth: 1,
                                borderColor: vars.secondaryBorderColor,
                                borderRadius: 14,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                            }}
                            placeholder="Recipe title"
                            placeholderTextColor="#aaa"
                            keyboardAppearance={theme === "light" ? "light" : "dark"}
                        />
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                                marginBottom: 8,
                            }}
                        >
                            Public
                        </Text>
                        <CustomSwitch
                            value={addRecipeFormStates.publicRecipe}
                            onChange={addRecipeFormActions.setPublicRecipe}
                        />
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                                marginBottom: 8,
                            }}
                        >
                            Banner
                        </Text>
                        {addRecipeFormStates.banner ? (
                            <View style={{ position: "relative", width: 120, height: 120 }}>
                                <Image
                                    source={{ uri: addRecipeFormStates.banner }}
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
                                    <PressableScale onPress={() => addRecipeFormActions.setBannerImage(null, null)}>
                                        <X size={16} color={vars.textColor} />
                                    </PressableScale>
                                </GlassOrBlurView>
                            </View>
                        ) : (
                            <ImageInput type="recipe" onPick={addRecipeFormActions.setBannerImage} />
                        )}
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                                marginBottom: 8,
                            }}
                        >
                            Source URL
                        </Text>
                        <TextInput
                            value={addRecipeFormStates.source}
                            onChangeText={addRecipeFormActions.setSource}
                            style={{
                                color: vars.textColor,
                                backgroundColor: vars.secondaryBackgroundColor,
                                borderWidth: 1,
                                borderColor: vars.secondaryBorderColor,
                                borderRadius: 14,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                            }}
                            placeholder="https://..."
                            placeholderTextColor="#aaa"
                            keyboardAppearance={theme === "light" ? "light" : "dark"}
                        />
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                                marginBottom: 8,
                            }}
                        >
                            Meal Type
                        </Text>
                        <MealTypeSegment
                            value={addRecipeFormStates.mealType}
                            onChange={addRecipeFormActions.setMealType}
                        />
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                                marginBottom: 8,
                            }}
                        >
                            Country
                        </Text>
                        <CountryInput
                            value={addRecipeFormStates.countryObject}
                            onChange={addRecipeFormActions.setCountryObject}
                        />
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                                marginBottom: 8,
                            }}
                        >
                            Time (minutes)
                        </Text>
                        <TextInput
                            value={String(addRecipeFormStates.time)}
                            onChangeText={(v) => addRecipeFormActions.setTime(Number(v))}
                            keyboardType="numeric"
                            returnKeyType="done"
                            style={{
                                color: vars.textColor,
                                backgroundColor: vars.secondaryBackgroundColor,
                                borderWidth: 1,
                                borderColor: vars.secondaryBorderColor,
                                borderRadius: 14,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                            }}
                            placeholder="e.g. 45"
                            placeholderTextColor="#aaa"
                            keyboardAppearance={theme === "light" ? "light" : "dark"}
                        />
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                                marginBottom: 8,
                            }}
                        >
                            Persons
                        </Text>
                        <TextInput
                            value={String(addRecipeFormStates.persons)}
                            onChangeText={(v) => addRecipeFormActions.setPersons(Number(v))}
                            keyboardType="numeric"
                            returnKeyType="done"
                            style={{
                                color: vars.textColor,
                                backgroundColor: vars.secondaryBackgroundColor,
                                borderWidth: 1,
                                borderColor: vars.secondaryBorderColor,
                                borderRadius: 14,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                            }}
                            placeholder="e.g. 4"
                            placeholderTextColor="#aaa"
                            keyboardAppearance={theme === "light" ? "light" : "dark"}
                        />
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                                marginBottom: 8,
                            }}
                        >
                            Ingredients
                        </Text>
                        {addRecipeFormStates.ingredients.map((ingredient, i) => (
                            <Ingredient
                                key={i}
                                ingredient={ingredient}
                                index={i}
                                onUpdate={addRecipeFormActions.updateIngredient}
                                onRemove={addRecipeFormActions.removeIngredient}
                            />
                        ))}

                        <PressableScale
                            onPress={addRecipeFormActions.addIngredient}
                            style={{
                                backgroundColor: vars.backgroundColor,
                                padding: 10,
                                borderWidth: 1,
                                borderColor: vars.borderColor,
                                borderRadius: 24,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: vars.textColor }}>+ Add Ingredient</Text>
                        </PressableScale>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontWeight: "600",
                                marginBottom: 8,
                            }}
                        >
                            Instructions
                        </Text>

                        {addRecipeFormStates.instructions.map((instruction, i) => (
                            <Instruction
                                key={i}
                                instruction={instruction}
                                index={i}
                                onUpdate={addRecipeFormActions.updateInstruction}
                                onRemove={addRecipeFormActions.removeInstruction}
                            />
                        ))}

                        <PressableScale
                            onPress={addRecipeFormActions.addInstruction}
                            style={{
                                backgroundColor: vars.backgroundColor,
                                padding: 10,
                                borderWidth: 1,
                                borderColor: vars.borderColor,
                                borderRadius: 24,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: vars.textColor }}>+ Add Instruction</Text>
                        </PressableScale>
                    </View>
                </View>
            </ScrollView>

            <PressableScale
                enabled={!addRecipeStates.loading}
                onPress={createRecipe}
                style={{
                    backgroundColor: vars.accentColor,
                    padding: 14,
                    borderRadius: 24,
                    alignItems: "center",
                    marginTop: 16,
                }}
            >
                {addRecipeStates.loading ? (
                    <ActivityIndicator color={vars.textColor} />
                ) : (
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Create Recipe</Text>
                )}
            </PressableScale>
        </>
    )
}
