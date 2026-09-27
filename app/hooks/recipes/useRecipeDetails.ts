import { useCallback, useEffect, useRef, useState } from "react"
import { useLocalSearchParams } from "expo-router"
import { recipesClient } from "@/lib/recipes"
import { Recipe } from "@/types/generated/models/recipe"
import { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import { useAiContextStore } from "@/stores/useAiContextStore"

export function useRecipeDetails() {
    const { id } = useLocalSearchParams()
    const { setRecipe: setRecipeContext } = useAiContextStore()

    const sheetRef = useRef<BottomSheetRef>(null)

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
            setRecipeContext(response)
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
