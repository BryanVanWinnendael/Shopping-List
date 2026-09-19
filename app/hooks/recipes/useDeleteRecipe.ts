import { recipesClient } from "@/lib/recipes"
import { storageClient } from "@/lib/storage"
import { useCallback, useState } from "react"
import Toast from "react-native-toast-message"
import { delay } from "@/lib/utils"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { Alert } from "react-native"
import { useHeaderStore } from "@/stores/useHeaderStore"

export default function useDeleteRecipe() {
    const { favoriteRecipes, recipes, deleteRecipe: deleteRecipeFromStore } = useRecipesStore()
    const { setHeaderText } = useHeaderStore()

    const [loading, setLoading] = useState<boolean>(false)

    const deleteRecipe = useCallback(
        async (id: string) => {
            const isFavorite = favoriteRecipes.some((favoriteRecipe) => favoriteRecipe.id === id)
            if (isFavorite) {
                Alert.alert("Failed to delete recipe", "Please unfavorite the recipe first.", [
                    {
                        text: "OK",
                    },
                ])
                return
            }

            setLoading(true)
            Toast.show({
                type: "success",
                text1: "Deleting Recipe...",
                autoHide: false,
            })

            const responseStorage = await storageClient.deleteRecipeStorage(id)
            if (!responseStorage) {
                Toast.show({
                    type: "error",
                    text1: "Failed to delete Recipe Storage",
                })
                return
            }

            const responseDeleteRecipe = await recipesClient.deleteRecipe(id)
            if (!responseDeleteRecipe) {
                Toast.show({
                    type: "error",
                    text1: "Failed to delete Recipe",
                })
                return
            }

            await delay(2000)

            if (responseDeleteRecipe) {
                deleteRecipeFromStore(id)
                setHeaderText("recipes", `${recipes.length - 1} Recipes`)
                Toast.show({
                    type: "success",
                    text1: "Recipe deleted successfully",
                })
            } else {
                Toast.show({
                    type: "error",
                    text1: "Failed to delete Recipe",
                })
            }

            setLoading(false)
            return responseDeleteRecipe
        },
        [favoriteRecipes]
    )

    return {
        actions: {
            setLoading,
            deleteRecipe,
        },
        states: {
            loading,
        },
    }
}
