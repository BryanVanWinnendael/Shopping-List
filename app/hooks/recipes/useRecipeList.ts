import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { recipesClient } from "@/lib/recipes"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { RecipeSummary } from "@/types/generated/models/recipe_summary"
import { DEBOUNCE_TIME } from "@/lib/constants"
import { useHeaderStore } from "@/stores/useHeaderStore"
import { FilterStates } from "@/types/recipes"

export function useRecipeList() {
    const { recipes, favoriteRecipes, setFavoriteRecipes, activeFilter, setRecipes } = useRecipesStore()

    const { user } = useSettingsStore()
    const { setHeaderText } = useHeaderStore()

    const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const loadingRef = useRef(false)

    const [page, setPage] = useState(1)
    const [hasNext, setHasNext] = useState(false)
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    const recipeFilters = useMemo<FilterStates>(
        () => ({
            country: activeFilter.country && activeFilter.country !== "Any" ? activeFilter.country : undefined,
            mealType: activeFilter.mealType,
            public: activeFilter.public,
            time: activeFilter.time !== null && activeFilter.time !== undefined ? activeFilter.time : null,
            isSaved: activeFilter.isSaved,
        }),
        [activeFilter.country, activeFilter.mealType, activeFilter.public, activeFilter.time, activeFilter.isSaved]
    )

    const filterKey = useMemo(() => JSON.stringify(recipeFilters), [recipeFilters])

    const setLoadingState = (value: boolean) => {
        loadingRef.current = value
        setLoading(value)
    }

    const getRecipes = useCallback(
        async (pageNumber = 1) => {
            if (!user || loadingRef.current) return

            setLoadingState(true)

            try {
                const response = await recipesClient.getRecipes(user, pageNumber, recipeFilters)

                if (!response) return

                setPage(response.page)
                setHasNext(response.hasNext)
                setHeaderText("recipes", `${response.total} Recipes`)

                if (pageNumber === 1) {
                    setRecipes(response.recipes)
                } else {
                    setRecipes((previous) => [...previous, ...response.recipes])
                }
            } finally {
                setLoadingState(false)
            }
        },
        [user, recipeFilters, setRecipes, setHeaderText]
    )

    const search = useCallback(
        async (searchQuery: string, pageNumber = 1) => {
            if (!user || loadingRef.current) return

            const trimmedQuery = searchQuery.trim()

            if (!trimmedQuery) {
                setQuery("")
                setIsSearching(false)
                setHeaderText("recipes", null)
                await getRecipes(1)
                return
            }

            setLoadingState(true)
            setIsSearching(true)
            setQuery(trimmedQuery)

            try {
                const response = await recipesClient.searchRecipes(user, pageNumber, trimmedQuery, recipeFilters)

                if (!response) return

                setPage(response.page)
                setHasNext(response.hasNext)
                setHeaderText("recipes", `${response.total} Recipes`)

                if (pageNumber === 1) {
                    setRecipes(response.recipes)
                } else {
                    setRecipes((previous) => [...previous, ...response.recipes])
                }
            } finally {
                setLoadingState(false)
            }
        },
        [user, recipeFilters, getRecipes, setRecipes, setHeaderText]
    )

    const getNextPage = useCallback(async () => {
        if (loading || !hasNext) return

        if (isSearching) {
            await search(query, page + 1)
        } else {
            await getRecipes(page + 1)
        }
    }, [loading, hasNext, isSearching, query, page, search, getRecipes])

    const updateQuery = useCallback(
        (nextQuery: string) => {
            setQuery(nextQuery)

            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current)
            }

            debounceTimeout.current = setTimeout(() => {
                void search(nextQuery, 1)
            }, DEBOUNCE_TIME)
        },
        [search]
    )

    const refresh = useCallback(async () => {
        setRefreshing(true)

        try {
            if (isSearching && query.trim()) {
                await search(query, 1)
            } else {
                await getRecipes(1)
            }
        } finally {
            setRefreshing(false)
        }
    }, [isSearching, query, search, getRecipes])

    const toggleFavorite = useCallback(
        async (recipe: RecipeSummary) => {
            const isFavorite = favoriteRecipes.some((favoriteRecipe) => favoriteRecipe.id === recipe.id)

            if (isFavorite) {
                await setFavoriteRecipes(favoriteRecipes.filter((favoriteRecipe) => favoriteRecipe.id !== recipe.id))
            } else {
                await setFavoriteRecipes([...favoriteRecipes, recipe])
            }
        },
        [favoriteRecipes, setFavoriteRecipes]
    )

    // Favorites are stored locally, so apply the visible filters
    // and the active search query to them here.
    const filteredFavorites = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        return favoriteRecipes.filter((recipe) => {
            if (!recipeFilters.public && recipe.public) {
                return false
            }

            if (recipeFilters.isSaved && !recipe.isSaved) {
                return false
            }

            if (
                recipeFilters.mealType !== "Any" &&
                recipe.mealType?.toLowerCase() !== recipeFilters.mealType.toLowerCase()
            ) {
                return false
            }

            if (recipeFilters.country && recipe.country?.toLowerCase() !== recipeFilters.country.toLowerCase()) {
                return false
            }

            if (recipeFilters.time != null && Number(recipe.time) > recipeFilters.time) {
                return false
            }

            if (normalizedQuery) {
                const title = recipe.title?.toLowerCase() ?? ""

                if (!title.includes(normalizedQuery)) {
                    return false
                }
            }

            return true
        })
    }, [favoriteRecipes, recipeFilters, query])

    const grouped = useMemo(() => {
        const favoriteIds = new Set(filteredFavorites.map((favoriteRecipe) => favoriteRecipe.id))

        return {
            favorites: filteredFavorites,
            userRecipes: recipes.filter((recipe) => recipe.user === user && !favoriteIds.has(recipe.id)),
            publicR: recipes.filter((recipe) => recipe.user !== user && !favoriteIds.has(recipe.id)),
        }
    }, [recipes, filteredFavorites, user])

    const sections = useMemo(() => {
        const result: Array<{ type: "section"; title: string } | { type: "recipe"; recipe: RecipeSummary }> = []

        const addSection = (title: string, recipesForSection: RecipeSummary[]) => {
            if (recipesForSection.length === 0) return

            result.push({
                type: "section",
                title,
            })

            recipesForSection.forEach((recipe) => {
                result.push({
                    type: "recipe",
                    recipe,
                })
            })
        }

        addSection("Favorite Recipes", grouped.favorites)
        addSection("My Recipes", grouped.userRecipes)
        addSection("Public Recipes", grouped.publicR)

        return result
    }, [grouped])

    // Initial load and reload whenever active filters change.
    useEffect(() => {
        if (query.trim()) {
            void search(query, 1)
        } else {
            void getRecipes(1)
        }
    }, [filterKey, getRecipes, search])

    useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current)
            }
        }
    }, [])

    return {
        states: {
            sections,
            refreshing,
            loading,
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
