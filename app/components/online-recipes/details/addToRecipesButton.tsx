import { useCallback } from "react"
import { ActivityIndicator, Alert, StyleSheet } from "react-native"
import { router } from "expo-router"
import Toast from "react-native-toast-message"
import { PressableScale } from "pressto"
import { GlassView } from "expo-glass-effect"
import { BookmarkPlus } from "lucide-react-native"

import useThemes from "@/hooks/themes/useThemes"
import useOnlineRecipeDetails from "@/hooks/recipes/useOnlineRecipeDetails"
import { delay } from "@/lib/utils"
import { BORDER_RADIUS_FULL } from "@/lib/theme"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"

type Props = {
    recipe: OnlineRecipeDetails
}

export default function AddToRecipesButton({ recipe }: Props) {
    const { vars, appearance } = useThemes()
    const { actions, states } = useOnlineRecipeDetails()

    const saveRecipe = useCallback(async () => {
        Toast.show({
            type: "success",
            text1: "Saving Recipe...",
            autoHide: false,
        })

        actions.setLoading(true)

        try {
            const response = await actions.addOnlineRecipeToRecipes(recipe)

            await delay(2000)

            if (!response) {
                Toast.show({ type: "error", text1: "Failed to save Recipe" })
                return
            }

            Toast.show({ type: "success", text1: "Recipe saved successfully" })
            router.replace("/recipes")
        } catch {
            Toast.show({ type: "error", text1: "Failed to save Recipe" })
        } finally {
            actions.setLoading(false)
        }
    }, [actions, recipe])

    const confirmSave = useCallback(() => {
        Alert.alert("Save Recipe", `"${recipe.title}" will be added to your recipes.`, [
            { text: "Cancel", style: "cancel" },
            { text: "Save", onPress: saveRecipe },
        ])
    }, [recipe.title, saveRecipe])

    return (
        <PressableScale
            enabled={!states.loading}
            onPress={confirmSave}
            accessibilityRole="button"
            accessibilityLabel="Save to my recipes"
            accessibilityState={{ busy: states.loading, disabled: states.loading }}
            style={styles.button}
        >
            <GlassView glassEffectStyle="regular" isInteractive colorScheme={appearance} style={styles.glass}>
                {states.loading ? (
                    <ActivityIndicator color={vars.textColor} />
                ) : (
                    <BookmarkPlus size={20} color={vars.textColor} />
                )}
            </GlassView>
        </PressableScale>
    )
}

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
        width: 48,
        height: 48,
    },
    glass: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
})
