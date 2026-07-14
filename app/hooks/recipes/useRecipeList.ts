import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { recipesClient } from "@/lib/recipes"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { RecipeSummary } from "@/types/generated/models/recipe_summary"

export function useRecipeList() {
    const { recipes, favoriteRecipes, setFavoriteRecipes, deleteRecipe: deleteRecipeStore } = useRecipesStore()
    const { activeFilter, filter, setRecipes } = useRecipesStore()
    const { user } = useSettingsStore()

    const loadingRef = useRef(false)

    const [page, setPage] = useState(1)
    const [hasNext, setHasNext] = useState(false)

    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const setLoadingState = (value: boolean) => {
        loadingRef.current = value
        setLoading(value)
    }

    const getRecipes = useCallback(
        async (pageNumber = 1) => {
            if (!user) return
            if (loadingRef.current) return

            setLoadingState(true)

            try {
                const response = await recipesClient.getRecipes(user, pageNumber)

                if (response) {
                    setPage(response.page)
                    setHasNext(response.hasNext)

                    if (pageNumber === 1) {
                        setRecipes(response.recipes)
                    } else {
                        setRecipes((prev) => [...prev, ...response.recipes])
                    }
                }
            } finally {
                setLoadingState(false)
            }
        },
        [user, setRecipes]
    )

    const getNextPage = useCallback(async () => {
        if (loading) return
        if (!hasNext) return

        await getRecipes(page + 1)
    }, [loading, hasNext, page, getRecipes])

    const refresh = useCallback(async () => {
        setRefreshing(true)

        try {
            await getRecipes(1)
        } finally {
            setRefreshing(false)
        }
    }, [getRecipes])

    const toggleFavorite = async (recipe: RecipeSummary) => {
        const isFavorite = favoriteRecipes.some((favoriteRecipe) => favoriteRecipe.id === recipe.id)

        if (isFavorite) {
            await setFavoriteRecipes(favoriteRecipes.filter((r) => r.id !== recipe.id))
        } else {
            await setFavoriteRecipes([...favoriteRecipes, recipe])
        }
    }

    const grouped = useMemo(() => {
        let favorites = favoriteRecipes

        let userRecipes = recipes.filter(
            (r) => r.user === user && !favoriteRecipes.some((recipe) => recipe.id === r.id)
        )

        let publicR = recipes.filter((r) => r.user !== user && !favoriteRecipes.some((recipe) => recipe.id === r.id))

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

        return {
            favorites,
            userRecipes,
            publicR,
        }
    }, [recipes, favoriteRecipes, activeFilter, filter, user])

    const sections = useMemo(() => {
        const arr: any[] = []

        const pushSection = (title: string, list: RecipeSummary[]) => {
            if (!list || list.length === 0) return

            arr.push({
                type: "section",
                title,
            })

            list.forEach((r) => {
                if (!r) return

                arr.push({
                    type: "recipe",
                    recipe: r,
                })
            })
        }

        pushSection("Favorite Recipes", grouped.favorites)
        pushSection("My Recipes", grouped.userRecipes)
        pushSection("Public Recipes", grouped.publicR)

        return arr
    }, [grouped])

    useEffect(() => {
        getRecipes(1)
    }, [getRecipes])

    return {
        states: {
            sections,
            refreshing,
            loading,
            favoriteRecipes,
            page,
            hasNext,
        },
        actions: {
            refresh,
            toggleFavorite,
            getRecipes,
            getNextPage,
        },
    }
}
