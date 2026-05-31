import { useCallback, useEffect, useMemo, useState } from "react"
import { recipesClient } from "@/lib/recipes"
import { storageClient } from "@/lib/storage"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { Recipe } from "@/types/recipes"

export function useRecipeList() {
    const {
        recipes,
        favoriteRecipes,
        setFavoriteRecipes,
        deleteRecipe: deleteRecipeStore,
        setUserRecipes,
    } = useRecipesStore()
    const { activeFilter, filter, setRecipes } = useRecipesStore()
    const { user } = useSettingsStore()

    const [refreshing, setRefreshing] = useState(false)

    const refresh = async () => {
        setRefreshing(true)
        await getRecipes()
        setRefreshing(false)
    }

    const deleteRecipe = async (recipe: Recipe) => {
        const responseStorage = await storageClient.deleteRecipeStorage(recipe.id)
        if (!responseStorage) return

        const responseRecipe = await recipesClient.deleteRecipe(recipe.id)
        if (responseRecipe) deleteRecipeStore(recipe.id)
    }

    const toggleFavorite = async (id: string) => {
        if (favoriteRecipes.includes(id)) {
            await setFavoriteRecipes(favoriteRecipes.filter((r) => r !== id))
        } else {
            await setFavoriteRecipes([...favoriteRecipes, id])
        }
    }

    const grouped = useMemo(() => {
        let favorites = recipes.filter((r) => favoriteRecipes.includes(r.id))
        let userRecipes = recipes.filter((r) => r.user === user && !favoriteRecipes.includes(r.id))
        let publicR = recipes.filter((r) => r.user !== user && !favoriteRecipes.includes(r.id))

        if (filter) {
            if (activeFilter.mealType !== "Any") {
                userRecipes = userRecipes.filter(
                    (r) => r.mealType?.toLowerCase() === activeFilter.mealType.toLowerCase()
                )
                publicR = publicR.filter((r) => r.mealType?.toLowerCase() === activeFilter.mealType.toLowerCase())
                favorites = favorites.filter((r) => r.mealType?.toLowerCase() === activeFilter.mealType.toLowerCase())
            }

            if (!activeFilter.public) {
                publicR = []
            }

            if (activeFilter.country && activeFilter.country !== "Any") {
                userRecipes = userRecipes.filter((r) => r.country?.toLowerCase() === activeFilter.country.toLowerCase())
                publicR = publicR.filter((r) => r.country?.toLowerCase() === activeFilter.country.toLowerCase())
                favorites = favorites.filter((r) => r.country?.toLowerCase() === activeFilter.country.toLowerCase())
            }

            if (activeFilter.time) {
                userRecipes = userRecipes.filter((r) => Number(r.time) <= activeFilter.time!)
                publicR = publicR.filter((r) => Number(r.time) <= activeFilter.time!)
                favorites = favorites.filter((r) => Number(r.time) <= activeFilter.time!)
            }
        }

        return { favorites, userRecipes, publicR }
    }, [recipes, favoriteRecipes, activeFilter, filter, user])

    const sections = useMemo(() => {
        const arr: any[] = []

        const pushSection = (title: string, list: Recipe[]) => {
            if (!list || list.length === 0) return

            arr.push({ type: "section", title })

            list.forEach((r) => {
                if (!r) return
                arr.push({ type: "recipe", recipe: r })
            })
        }

        pushSection("Favorite Recipes", grouped.favorites)
        pushSection("My Recipes", grouped.userRecipes)
        pushSection("Public Recipes", grouped.publicR)

        return arr
    }, [grouped])

    const getRecipes = useCallback(async () => {
        if (!user) return

        const responseRecipes = await recipesClient.getRecipes()

        if (!responseRecipes) return
        const filteredRecipes = responseRecipes.filter((recipe) => recipe.user !== user)

        const responseUserRecipes = await recipesClient.getUserRecipes(user)
        if (responseUserRecipes) {
            setUserRecipes(responseUserRecipes)
            const cRecipes = [...filteredRecipes, ...responseUserRecipes]
            setRecipes(cRecipes)
        }
    }, [user])

    useEffect(() => {
        getRecipes()
    }, [getRecipes])

    return {
        states: {
            sections,
            refreshing,
            favoriteRecipes,
        },
        actions: {
            refresh,
            deleteRecipe,
            toggleFavorite,
            getRecipes,
        },
    }
}
