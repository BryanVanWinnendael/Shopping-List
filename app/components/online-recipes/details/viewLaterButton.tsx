import { useCallback } from "react"
import { StyleSheet } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { PressableScale } from "pressto"
import { Pin, PinOff } from "lucide-react-native"
import LiquidGlassView from "@/components/native/liquidGlassView"
import useThemes from "@/hooks/themes/useThemes"
import { useViewLaterStore } from "@/stores/useViewLaterStore"
import { BORDER_RADIUS_FULL, FAB_ICON_SIZE, FAB_SIZE } from "@/lib/theme"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"

type Props = {
    recipe: OnlineRecipeDetails
}

export default function ViewLaterButton({ recipe }: Props) {
    const { vars } = useThemes()
    const { url } = useLocalSearchParams()
    const { recipes: viewLater, toggleViewLater } = useViewLaterStore()

    const recipeUrl = typeof url === "string" ? url : ""
    const isPinned = !!recipeUrl && viewLater.some((item) => item.url === recipeUrl)

    const toggle = useCallback(async () => {
        if (!recipeUrl) return

        await toggleViewLater({
            title: recipe.title,
            url: recipeUrl,
            image: recipe.image,
        })
    }, [recipeUrl, recipe.title, recipe.image, toggleViewLater])

    return (
        <PressableScale
            enabled={!!recipeUrl}
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={isPinned ? "Remove from view later" : "Save for later"}
            accessibilityState={{ selected: isPinned, disabled: !recipeUrl }}
            style={styles.button}
        >
            <LiquidGlassView style={styles.glass} isInteractive>
                {isPinned ? (
                    <PinOff size={FAB_ICON_SIZE} color={vars.textColor} />
                ) : (
                    <Pin size={FAB_ICON_SIZE} color={vars.textColor} />
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
