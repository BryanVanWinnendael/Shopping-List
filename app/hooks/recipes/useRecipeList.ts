import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { recipesClient } from "@/lib/recipes"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { RecipeSummary } from "@/types/generated/models/recipe_summary"
import { DEBOUNCE_TIME } from "@/lib/constants"
import { useHeaderStore } from "@/stores/useHeaderStore"

export function useRecipeList() {
    const { recipes, favoriteRecipes, setFavoriteRecipes } = useRecipesStore()
    const { activeFilter, filter, setRecipes } = useRecipesStore()
    const { user } = useSettingsStore()
    const { setHeaderText } = useHeaderStore()

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
    const loadingRef = useRef(false)

    const [page, setPage] = useState(1)
    const [hasNext, setHasNext] = useState(false)
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

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
                    setHeaderText("recipes", `${response.total} Recipes`)

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
        [user, setRecipes, setHeaderText]
    )

    const search = useCallback(
        async (q: string, pageNumber = 1) => {
            if (!user) return
            if (loadingRef.current) return

            if (!q.trim()) {
                setQuery("")
                setIsSearching(false)
                setHeaderText("recipes", null)
                setRecipes([])
                await getRecipes(1)
                return
            }

            setLoadingState(true)
            setIsSearching(true)
            setQuery(q)

            try {
                const response = await recipesClient.searchRecipes(user, pageNumber, q)

                if (response) {
                    setPage(response.page)
                    setHasNext(response.hasNext)
                    setHeaderText("recipes", `${response.total} Recipes`)

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
        [user, getRecipes, setRecipes, setHeaderText]
    )

    const getNextPage = useCallback(async () => {
        if (loading) return
        if (!hasNext) return

        if (isSearching) {
            await search(query, page + 1)
        } else {
            await getRecipes(page + 1)
        }
    }, [loading, hasNext, page, isSearching, query, search, getRecipes])

    const updateQuery = (q: string) => {
        setQuery(q)

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }

        debounceTimeout.current = setTimeout(async () => {
            await search(q, 1)
        }, DEBOUNCE_TIME)
    }

    const refresh = useCallback(async () => {
        setRefreshing(true)

        try {
            if (isSearching) {
                await search(query, 1)
            } else {
                await getRecipes(1)
            }
        } finally {
            setRefreshing(false)
        }
    }, [isSearching, query, search, getRecipes])

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
            query,
        },
        actions: {
            refresh,
            toggleFavorite,
            getRecipes,
            getNextPage,
            updateQuery,
        },
    }
}
