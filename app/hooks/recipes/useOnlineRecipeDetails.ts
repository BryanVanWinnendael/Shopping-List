import { useCallback, useEffect, useRef, useState } from "react"
import { CreateRecipeRequest, Ingredient, OnlineRecipe } from "@/types/recipes"
import { onlineRecipesClient } from "@/lib/online-recipes"
import { useLocalSearchParams } from "expo-router"
import GorhomBottomSheet from "@gorhom/bottom-sheet"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { useCreateRecipe } from "@/hooks/recipes/useCreateRecipe"

export default function useOnlineRecipeDetails() {
    const { user } = useSettingsStore()
    const { url } = useLocalSearchParams()
    const { actions: addRecipeActions } = useCreateRecipe()

    const [recipe, setRecipe] = useState<OnlineRecipe | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const sheetRef = useRef<GorhomBottomSheet>(null)

    const open = () => sheetRef.current?.expand()
    const close = () => sheetRef.current?.close()

    const mapIngredients = (ingredients: string[] | undefined) => {
        if (!ingredients || ingredients.length === 0) return []

        return ingredients.map((ingredient) => {
            return {
                product: ingredient,
                type: "string",
            } as Ingredient
        })
    }

    const addOnlineRecipeToRecipes = async (recipe: OnlineRecipe) => {
        if (!user || !recipe) return

        const request: CreateRecipeRequest = {
            user,
            title: recipe.title,
            banner: recipe.image,
            source: recipe.source,
            public: true,
            instructions: recipe.instructions,
            ingredients: mapIngredients(recipe.ingredients),
            persons: recipe.persons,
            time: recipe.time,
        }

        const response = await addRecipeActions.createRecipe(request)
        return response
    }

    const getOnlineRecipeDetails = useCallback(async () => {
        if (!url || Array.isArray(url)) return

        const response = await onlineRecipesClient.getOnlineRecipeDetails(url)
        if (response) {
            setRecipe(response)
        }
    }, [url])

    useEffect(() => {
        getOnlineRecipeDetails()
    }, [])

    return {
        refs: {
            sheetRef,
        },
        actions: {
            open,
            close,
            addOnlineRecipeToRecipes,
            setLoading,
        },
        states: {
            recipe,
            loading,
        },
    }
}
