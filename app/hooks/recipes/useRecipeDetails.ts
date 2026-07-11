import { useCallback, useEffect, useRef, useState } from "react"
import { useLocalSearchParams } from "expo-router"
import { recipesClient } from "@/lib/recipes"
import GorhomBottomSheet from "@gorhom/bottom-sheet"
import { Recipe } from "@/types/generated/models/recipe"

export function useRecipeDetails() {
    const { id } = useLocalSearchParams()

    const sheetRef = useRef<GorhomBottomSheet>(null)

    const [recipe, setRecipe] = useState<Recipe>({
        banner: undefined,
        country: undefined,
        instructions: [],
        ingredients: [],
        mealType: undefined,
        public: false,
        source: undefined,
        time: undefined,
        title: "",
        user: "",
        id: "",
    })

    const open = () => sheetRef.current?.expand()
    const close = () => sheetRef.current?.close()

    const getRecipe = useCallback(async () => {
        if (!id || Array.isArray(id)) return

        const response = await recipesClient.getRecipe(id)
        if (response) {
            setRecipe(response)
        }
    }, [id])

    useEffect(() => {
        getRecipe()
    }, [getRecipe])

    return {
        refs: {
            sheetRef,
        },
        states: {
            recipe,
        },
        actions: {
            setRecipe,
            open,
            close,
        },
    }
}
