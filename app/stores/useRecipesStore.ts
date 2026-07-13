import { create } from "zustand"
import {
    getActiveRecipeFilter,
    getFavoriteRecipes,
    recipesClient,
    setActiveRecipeFilter,
    setFavoriteRecipes as persistFavoriteRecipes,
} from "@/lib/recipes"
import { FilterStates } from "@/types/recipes"
import { getUser } from "@/lib/user"
import { RecipeSummary } from "@/types/generated/models/recipe_summary"

type RecipesState = {
    filter: boolean
    activeFilter: FilterStates

    recipes: RecipeSummary[]
    userRecipes: RecipeSummary[]
    favoriteRecipes: string[]

    loadRecipes: () => Promise<void>

    setFilter: (filter: boolean) => void
    setActiveFilter: (filter: FilterStates) => Promise<void>
    updateFilter: (filter: Partial<FilterStates>) => void

    setRecipes: (recipes: RecipeSummary[]) => void
    setUserRecipes: (recipes: RecipeSummary[]) => void

    addRecipe: (recipe: RecipeSummary) => void
    updateRecipe: (recipe: RecipeSummary) => void
    deleteRecipe: (id: string) => void

    setFavoriteRecipes: (recipes: string[]) => Promise<void>
}

function sortByTitle(recipes: RecipeSummary[]) {
    return [...recipes].sort((a, b) =>
        a.title.localeCompare(b.title, undefined, {
            sensitivity: "base",
        })
    )
}

export const useRecipesStore = create<RecipesState>((set) => ({
    filter: false,
    activeFilter: {
        public: true,
        mealType: "Any",
        country: "",
        time: null,
    },

    recipes: [],
    userRecipes: [],
    favoriteRecipes: [],

    loadRecipes: async () => {
        const storedFilter = await getActiveRecipeFilter()
        if (storedFilter) {
            set({ activeFilter: storedFilter })
        }

        const storedFavorites = await getFavoriteRecipes()
        if (storedFavorites !== null) {
            set({ favoriteRecipes: storedFavorites })
        }

        const user = await getUser()
        const response = await recipesClient.getUserRecipes(user)
        if (response) {
            set({
                userRecipes: sortByTitle(response),
            })
        }
    },

    setFilter: (filter) => set({ filter }),

    setActiveFilter: async (filter) => {
        set({ activeFilter: filter })
        await setActiveRecipeFilter(filter)
    },

    updateFilter: (data) =>
        set((state) => ({
            activeFilter: { ...state.activeFilter, ...data },
        })),

    setRecipes: (recipes) =>
        set({
            recipes: sortByTitle(recipes),
        }),

    setUserRecipes: (recipes) =>
        set({
            userRecipes: sortByTitle(recipes),
        }),

    addRecipe: (recipe) =>
        set((state) => ({
            recipes: sortByTitle([...state.recipes, recipe]),
            userRecipes: recipe.user ? sortByTitle([...state.userRecipes, recipe]) : state.userRecipes,
        })),

    updateRecipe: (updated) =>
        set((state) => ({
            recipes: sortByTitle(state.recipes.map((r) => (r.id === updated.id ? updated : r))),
            userRecipes: sortByTitle(state.userRecipes.map((r) => (r.id === updated.id ? updated : r))),
        })),

    deleteRecipe: (id) =>
        set((state) => ({
            recipes: state.recipes.filter((r) => r.id !== id),
            userRecipes: state.userRecipes.filter((r) => r.id !== id),
        })),

    setFavoriteRecipes: async (recipes) => {
        set({ favoriteRecipes: recipes })
        await persistFavoriteRecipes(recipes)
    },
}))
