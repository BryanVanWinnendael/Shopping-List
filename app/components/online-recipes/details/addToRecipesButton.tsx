import { useCallback } from "react"
import { ActivityIndicator, Alert, StyleSheet } from "react-native"
import { router } from "expo-router"
import Toast from "react-native-toast-message"
import { PressableScale } from "pressto"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { BookmarkPlus } from "lucide-react-native"

import useThemes from "@/hooks/themes/useThemes"
import useOnlineRecipeDetails from "@/hooks/recipes/useOnlineRecipeDetails"
import { delay } from "@/lib/utils"
import { BORDER_RADIUS_FULL, FAB_ICON_SIZE, FAB_SIZE } from "@/lib/theme"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"

type Props = {
    recipe: OnlineRecipeDetails
}

export default function AddToRecipesButton({ recipe }: Props) {
    const { vars } = useThemes()
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
            <LiquidGlassView style={styles.glass} isInteractive>
                {states.loading ? (
                    <ActivityIndicator color={vars.textColor} />
                ) : (
                    <BookmarkPlus size={FAB_ICON_SIZE} color={vars.textColor} />
                )}
            </LiquidGlassView>
        </PressableScale>
    )
}

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
        width: FAB_SIZE,
        height: FAB_SIZE,
    },
    glass: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
})
