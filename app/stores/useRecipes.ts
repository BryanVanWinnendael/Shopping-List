import { create } from "zustand"
import { FilterStates, Recipe, Users } from "@/types"
import {
  getFavoriteRecipes,
  getStoredRecipes,
  storeRecipesLocally,
  setFavoriteRecipes,
  setActiveRecipeFilter,
  getActiveRecipeFilter,
} from "@/lib/recipes"

type RecipesState = {
  filter: boolean
  activeFilter: FilterStates
  setActiveFilter: (filter: FilterStates) => void
  loadRecipes: () => Promise<void>
  setFilter: (filter: boolean) => void
  favoriteRecipes: string[]
  recipes: Recipe[]
  storedRecipes: Recipe[]
  setStoredRecipes: (recipes: Recipe[]) => void
  setRecipes: (recipes: Recipe[], user: Users) => void
  setFavoriteRecipes: (recipes: string[]) => void
}

export const useRecipes = create<RecipesState>((set) => ({
  filter: false,
  activeFilter: {
    public: true,
    mealType: "Any",
    country: "",
    time: null,
  },
  favoriteRecipes: [],
  recipes: [],
  storedRecipes: [],

  loadRecipes: async () => {
    const storedFilter = await getActiveRecipeFilter()
    if (storedFilter) {
      set({ activeFilter: storedFilter })
    }

    const storedFavoriteRecipes = await getFavoriteRecipes()
    if (storedFavoriteRecipes !== null) {
      set({ favoriteRecipes: storedFavoriteRecipes })
    }

    const storedRecipes = await getStoredRecipes()
    if (storedRecipes !== null) {
      set({ storedRecipes: storedRecipes })
    }
  },

  setFilter: (filter: boolean) => {
    set(() => ({ filter: filter }))
  },

  setActiveFilter: async (filter: FilterStates) => {
    set(() => ({ activeFilter: filter }))
    await setActiveRecipeFilter(filter)
  },

  setRecipes: async (recipes, user) => {
    set({ recipes })
    await storeRecipesLocally(recipes, user)
  },

  setFavoriteRecipes: async (recipes: string[]) => {
    set({ favoriteRecipes: recipes })
    await setFavoriteRecipes(recipes)
  },

  setStoredRecipes: (recipes: Recipe[]) => {
    set({ storedRecipes: recipes })
  },
}))
