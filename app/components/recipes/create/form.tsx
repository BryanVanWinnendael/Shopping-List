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
import { GlassView } from "expo-glass-effect"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    onClose: () => void
}

export default function Form({ onClose }: Props) {
    const { vars, appearance } = useThemes()
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

    const inputStyle = {
        color: vars.textColor,
        backgroundColor: vars.backgroundColor,
        borderWidth: 1,
        borderColor: vars.borderColor,
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
                        value={addRecipeFormStates.title}
                        onChangeText={addRecipeFormActions.setTitle}
                        style={inputStyle}
                        placeholder="Recipe title"
                        placeholderTextColor={vars.tertiaryTextColor}
                        keyboardAppearance={appearance}
                    />
                </View>

                <View style={styles.rowSection}>
                    <View style={styles.labelBlock}>
                        <Text style={labelStyle}>Public</Text>

                        <Text
                            style={{
                                color: vars.tertiaryTextColor,
                                fontSize: 13,
                                marginTop: -5,
                            }}
                        >
                            Make this recipe visible to others
                        </Text>
                    </View>

                    <CustomSwitch
                        value={addRecipeFormStates.publicRecipe}
                        onChange={addRecipeFormActions.setPublicRecipe}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={labelStyle}>Banner</Text>

                    {addRecipeFormStates.banner ? (
                        <View style={styles.bannerContainer}>
                            <Image
                                source={{
                                    uri: addRecipeFormStates.banner,
                                }}
                                style={styles.banner}
                            />

                            <View style={styles.bannerClose}>
                                <GlassView
                                    glassEffectStyle="regular"
                                    isInteractive
                                    colorScheme={appearance}
                                    style={styles.closeGlass}
                                >
                                    <PressableScale
                                        onPress={() => addRecipeFormActions.setBannerImage(null, null)}
                                        style={styles.closeButton}
                                    >
                                        <X size={17} strokeWidth={2} color={vars.textColor} />
                                    </PressableScale>
                                </GlassView>
                            </View>
                        </View>
                    ) : (
                        <ImageInput type="recipe" onPick={addRecipeFormActions.setBannerImage} />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={labelStyle}>Source URL</Text>

                    <TextInput
                        value={addRecipeFormStates.source}
                        onChangeText={addRecipeFormActions.setSource}
                        style={inputStyle}
                        placeholder="https://..."
                        placeholderTextColor={vars.tertiaryTextColor}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardAppearance={appearance}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={labelStyle}>Meal Type</Text>

                    <MealTypeSegment value={addRecipeFormStates.mealType} onChange={addRecipeFormActions.setMealType} />
                </View>

                <View style={styles.section}>
                    <Text style={labelStyle}>Country</Text>

                    <CountryInput
                        value={addRecipeFormStates.countryObject}
                        onChange={addRecipeFormActions.setCountryObject}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={labelStyle}>Time</Text>

                    <TextInput
                        value={String(addRecipeFormStates.time)}
                        onChangeText={(value) => addRecipeFormActions.setTime(Number(value))}
                        keyboardType="numeric"
                        returnKeyType="done"
                        style={inputStyle}
                        placeholder="e.g. 45 minutes"
                        placeholderTextColor={vars.tertiaryTextColor}
                        keyboardAppearance={appearance}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={labelStyle}>Persons</Text>

                    <TextInput
                        value={String(addRecipeFormStates.persons)}
                        onChangeText={(value) => addRecipeFormActions.setPersons(Number(value))}
                        keyboardType="numeric"
                        returnKeyType="done"
                        style={inputStyle}
                        placeholder="e.g. 4"
                        placeholderTextColor={vars.tertiaryTextColor}
                        keyboardAppearance={appearance}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={labelStyle}>Ingredients</Text>

                    <View style={{ gap: 10 }}>
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
                                backgroundColor: vars.backgroundColor,
                                borderColor: vars.borderColor,
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
                                backgroundColor: vars.backgroundColor,
                                borderColor: vars.borderColor,
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

            <View style={styles.createButtonContainer}>
                <GlassView
                    glassEffectStyle="regular"
                    isInteractive={!addRecipeStates.loading}
                    colorScheme={appearance}
                    style={styles.createGlass}
                >
                    <PressableScale
                        enabled={!addRecipeStates.loading}
                        onPress={createRecipe}
                        style={[
                            styles.createButton,
                            {
                                backgroundColor: `${vars.accentColor}E6`,
                            },
                        ]}
                    >
                        {addRecipeStates.loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.createButtonText}>Create Recipe</Text>
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
    createButtonContainer: {
        position: "absolute" as const,
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "transparent",
    },
    createGlass: {
        minHeight: 54,
        borderRadius: BORDER_RADIUS_L,
        overflow: "hidden" as const,
    },
    createButton: {
        minHeight: 54,
        alignItems: "center" as const,
        justifyContent: "center" as const,
    },

    createButtonText: {
        color: "#fff",
        fontWeight: "700" as const,
        fontSize: 16,
    },
}
