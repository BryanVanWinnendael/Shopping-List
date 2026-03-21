import { Recipe, Users } from "@/types"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { httpRequest } from "./httpHelper"

const RECIPES_PATH = "/recipes"
const RECIPES_KEY = "app_recipes"
const FAVORITE_RECIPES_KEY = "app_favoriteRecipes"
const ACTIVE_RECIPE_FILTER_KEY = "app_recipeFilter"

export const getRecipes = async (): Promise<Recipe[]> => {
  try {
    const response = await httpRequest<Recipe[]>({
      url: RECIPES_PATH,
      method: "GET",
    })

    return response.data
  } catch (error) {
    console.error("Error fetching recipes:", error)
    return []
  }
}

export const addRecipe = async (recipe: Recipe): Promise<boolean> => {
  try {
    await httpRequest<void, Recipe>({
      url: RECIPES_PATH,
      method: "POST",
      body: recipe,
    })

    return true
  } catch (error) {
    console.error("Error adding recipe:", error)
    return false
  }
}

export const getRecipe = async (id: string): Promise<Recipe | null> => {
  try {
    const response = await httpRequest<Recipe>({
      url: `${RECIPES_PATH}/${id}`,
      method: "GET",
    })

    return response.data
  } catch (error) {
    console.error("Error fetching recipe:", error)
    return null
  }
}

export const getUserRecipes = async (user: Users): Promise<Recipe[]> => {
  try {
    const response = await httpRequest<Recipe[]>({
      url: `${RECIPES_PATH}/users/${user}`,
      method: "GET",
    })

    return response.data
  } catch (error) {
    console.error("Error fetching user recipes:", error)
    return []
  }
}

export const deleteRecipe = async (id: string): Promise<boolean> => {
  try {
    await httpRequest<void>({
      url: `${RECIPES_PATH}/${id}`,
      method: "DELETE",
    })

    return true
  } catch (error) {
    console.error("Error deleting recipe:", error)
    return false
  }
}

export const editRecipe = async (recipe: Recipe): Promise<Recipe | null> => {
  try {
    const response = await httpRequest<Recipe, Recipe>({
      url: `${RECIPES_PATH}/${recipe.id}`,
      method: "PUT",
      body: recipe,
    })

    return response.data
  } catch (error) {
    console.error("Error editing recipe:", error)
    return recipe
  }
}

export const getRecipesCountries = async (): Promise<string[]> => {
  try {
    const response = await httpRequest<string[]>({
      url: `${RECIPES_PATH}/countries`,
      method: "GET",
    })

    return response.data
  } catch (error) {
    console.error("Error fetching recipe countries:", error)
    return []
  }
}

export const getFavoriteRecipes = async () => {
  const storedFavoriteRecipes = await AsyncStorage.getItem(FAVORITE_RECIPES_KEY)
  if (!storedFavoriteRecipes) return []
  return JSON.parse(storedFavoriteRecipes)
}

export const setFavoriteRecipes = async (recipes: string[]) => {
  await AsyncStorage.setItem(FAVORITE_RECIPES_KEY, JSON.stringify(recipes))
}

export const storeRecipesLocally = async (recipes: Recipe[], user: Users) => {
  try {
    const favoriteRecipesIds = await getFavoriteRecipes()
    const favoriteSet = new Set(favoriteRecipesIds)

    const favoriteRecipes = recipes
      .filter((r) => favoriteSet.has(r.id))
      .slice(0, 5)

    const myPrivateRecipes = recipes
      .filter(
        (r) => !r.public && r.createdBy === user && !favoriteSet.has(r.id),
      )
      .slice(0, 5)

    const publicRecipes = recipes
      .filter((r) => r.public && r.createdBy !== user && !favoriteSet.has(r.id))
      .slice(0, 5)

    const subsetToStore = [
      ...favoriteRecipes,
      ...myPrivateRecipes,
      ...publicRecipes,
    ]

    await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(subsetToStore))
  } catch (e) {
    console.error("Failed to store recipes locally", e)
  }
}

export const getStoredRecipes = async (): Promise<Recipe[]> => {
  const storedRecipes = await AsyncStorage.getItem(RECIPES_KEY)
  if (!storedRecipes) return []
  return JSON.parse(storedRecipes)
}

export const setActiveRecipeFilter = async (filter: any) => {
  await AsyncStorage.setItem(ACTIVE_RECIPE_FILTER_KEY, JSON.stringify(filter))
}

export const getActiveRecipeFilter = async (): Promise<any> => {
  const storedFilter = await AsyncStorage.getItem(ACTIVE_RECIPE_FILTER_KEY)
  if (!storedFilter) return null
  return JSON.parse(storedFilter)
}
