import { create } from "zustand"

import { Products } from "@/types/list"
import { RecipeSummary } from "@/types/generated/models/recipe_summary"
import { Recipe } from "@/types/generated/models/recipe"

import { useProductsListStore } from "@/stores/useProductsListStore"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { clearAIProvider, getAIProvider, setAIProvider } from "@/lib/ai/settings"
import { AIProvider } from "@/types/ai"

type AiContextState = {
    products: Products | null

    recipes: RecipeSummary[] | null
    setRecipes: (recipes: RecipeSummary[]) => void

    recipe: Recipe | null
    setRecipe: (recipe: Recipe) => void

    provider: AIProvider | null
    loadProvider: () => Promise<void>
    setProvider: (provider: AIProvider | null) => Promise<void>
    clearProvider: () => Promise<void>
}

export const useAiContextStore = create<AiContextState>((set) => ({
    products: useProductsListStore.getState().products,
    recipes: null,
    recipe: null,
    provider: null,

    setRecipes: (recipes) => {
        set({ recipes })
    },

    setRecipe: (recipe) => {
        set({ recipe })
    },

    loadProvider: async () => {
        const provider = await getAIProvider()

        set({
            provider,
        })
    },

    setProvider: async (provider) => {
        await setAIProvider(provider)

        set({
            provider,
        })
    },

    clearProvider: async () => {
        await clearAIProvider()
        set({
            provider: null,
        })
    },
}))

useProductsListStore.subscribe((state) => {
    useAiContextStore.setState({
        products: state.products,
    })
})

useRecipesStore.subscribe((state) => {
    useAiContextStore.setState({
        recipes: state.recipes,
    })
})
