import { create } from "zustand"
import { Products } from "@/types/list"
import { RecipeSummary } from "@/types/generated/models/recipe_summary"
import { Recipe } from "@/types/generated/models/recipe"
import { CronProduct } from "@/types/generated/models/cron_product"
import { OnlineRecipe } from "@/types/generated/models/online_recipe"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"
import { Product as SearchProduct } from "@/types/generated/models/product"
import { useProductsListStore } from "@/stores/useProductsListStore"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { useWeeklyStore } from "@/stores/useWeeklyStore"
import { clearAIProvider, getAIProvider, setAIProvider } from "@/lib/ai/settings"
import { AIProvider } from "@/types/ai"

export type SearchSnapshot = {
    query: string
    products: SearchProduct[]
}

export type LogSummary = {
    total: number
    recentTraceIds: string[]
}

export type AiContextState = {
    products: Products | null

    recipes: RecipeSummary[] | null
    setRecipes: (recipes: RecipeSummary[]) => void

    recipe: Recipe | null
    setRecipe: (recipe: Recipe | null) => void

    weeklyProducts: CronProduct[]

    onlineRecipes: OnlineRecipe[]
    setOnlineRecipes: (recipes: OnlineRecipe[]) => void

    onlineRecipe: OnlineRecipeDetails | null
    setOnlineRecipe: (recipe: OnlineRecipeDetails | null) => void

    searchSnapshot: SearchSnapshot | null
    setSearchSnapshot: (snapshot: SearchSnapshot) => void

    logSummary: LogSummary | null
    setLogSummary: (summary: LogSummary) => void

    provider: AIProvider | null
    loadProvider: () => Promise<void>
    setProvider: (provider: AIProvider | null) => Promise<void>
    clearProvider: () => Promise<void>
}

export const useAiContextStore = create<AiContextState>((set) => ({
    products: useProductsListStore.getState().products,
    recipes: null,
    recipe: null,
    weeklyProducts: useWeeklyStore.getState().cronProducts,
    onlineRecipes: [],
    onlineRecipe: null,
    searchSnapshot: null,
    logSummary: null,
    provider: null,

    setRecipes: (recipes) => {
        set({ recipes })
    },

    setRecipe: (recipe) => {
        set({ recipe })
    },

    setOnlineRecipes: (recipes) => {
        set({ onlineRecipes: recipes })
    },

    setOnlineRecipe: (recipe) => {
        set({ onlineRecipe: recipe })
    },

    setSearchSnapshot: (snapshot) => {
        set({ searchSnapshot: snapshot })
    },

    setLogSummary: (summary) => {
        set({ logSummary: summary })
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

useWeeklyStore.subscribe((state) => {
    useAiContextStore.setState({
        weeklyProducts: state.cronProducts,
    })
})
