import { OnlineRecipe } from "@/types/recipes"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { BookmarkPlus } from "lucide-react-native"
import useOnlineRecipeDetails from "@/hooks/recipes/useOnlineRecipeDetails"
import { useCallback } from "react"
import { ActivityIndicator, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Toast from "react-native-toast-message"
import { delay } from "@/lib/utils"
import { router } from "expo-router"

type Props = {
    recipe: OnlineRecipe
}

export default function AddToRecipesButton({ recipe }: Props) {
    const { vars } = useThemes()
    const { actions, states } = useOnlineRecipeDetails()
    const navigation = useNavigation()

    const addToRecipe = useCallback(() => {
        Alert.alert("Save Recipe", `"${recipe.title}" will be added to your recipes.`, [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Save",
                onPress: async () => {
                    Toast.show({
                        type: "success",
                        text1: "Saving Recipe...",
                        autoHide: false,
                    })
                    actions.setLoading(true)

                    const response = await actions.addOnlineRecipeToRecipes(recipe)

                    await delay(2000)

                    actions.setLoading(false)

                    if (response) {
                        Toast.show({
                            type: "success",
                            text1: "Recipe saved successfully",
                        })
                        navigation.goBack()
                        router.push("/recipes")
                    } else {
                        Toast.show({
                            type: "error",
                            text1: "Failed to save Recipe",
                        })
                    }
                },
            },
        ])
    }, [])

    return (
        <PressableScale
            enabled={!states.loading}
            onPress={addToRecipe}
            style={{
                justifyContent: "center",
                alignItems: "center",
                width: 40,
                height: 40,
            }}
        >
            <GlassOrBlurView
                borderColor={`${vars.secondaryBorderColor}50`}
                style={[
                    {
                        borderRadius: 50,
                        overflow: "hidden",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 8,
                        width: 40,
                        height: 40,
                    },
                ]}
            >
                {states.loading ? (
                    <ActivityIndicator color={vars.textColor} />
                ) : (
                    <BookmarkPlus size={20} color={vars.textColor} />
                )}
            </GlassOrBlurView>
        </PressableScale>
    )
}
