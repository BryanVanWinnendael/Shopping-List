import { create } from "zustand"
import { getViewLaterRecipes, setViewLaterRecipes } from "@/lib/online-recipes"
import { OnlineRecipe } from "@/types/generated/models/online_recipe"

type ViewLaterState = {
    recipes: OnlineRecipe[]

    loadViewLater: () => Promise<void>
    toggleViewLater: (recipe: OnlineRecipe) => Promise<void>
}

export const useViewLaterStore = create<ViewLaterState>((set, get) => ({
    recipes: [],

    loadViewLater: async () => {
        set({ recipes: await getViewLaterRecipes() })
    },

    toggleViewLater: async (recipe) => {
        const current = get().recipes
        const isPinned = current.some((item) => item.url === recipe.url)

        const next = isPinned ? current.filter((item) => item.url !== recipe.url) : [...current, recipe]

        set({ recipes: next })
        await setViewLaterRecipes(next)
    },
}))
