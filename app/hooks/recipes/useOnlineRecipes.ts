import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { OnlineRecipeFilter, onlineRecipesClient } from "@/lib/online-recipes"
import { OnlineRecipe } from "@/types/generated/models/online_recipe"
import { useHeaderStore } from "@/stores/useHeaderStore"
import { useViewLaterStore } from "@/stores/useViewLaterStore"

// View-later recipes float to the top, keeping their original order.
const pinFirst = (recipes: OnlineRecipe[], pinnedUrls: string[]) => {
    if (!pinnedUrls.length) return recipes

    const pinned = new Set(pinnedUrls)

    return [
        ...recipes.filter((recipe) => pinned.has(recipe.url)),
        ...recipes.filter((recipe) => !pinned.has(recipe.url)),
    ]
}

export default function useOnlineRecipes() {
    const { setHeaderText } = useHeaderStore()
    const viewLater = useViewLaterStore((state) => state.recipes)

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
    const loadingRef = useRef(false)

    const [recipes, setRecipes] = useState<OnlineRecipe[]>([])
    const [page, setPage] = useState(0)
    const [maxPages, setMaxPages] = useState(0)
    const [totalRecipes, setTotalRecipes] = useState(0)

    const [loading, setLoading] = useState(false)
    const [style, setStyle] = useState<"list" | "grid">("list")

    const [query, setQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [filter, setFilter] = useState<OnlineRecipeFilter>({
        kitchens: [],
        courses: [],
        dishes: [],
        specials: [],
    })

    // Read through a ref so getPage/search keep a stable identity: they run in the
    // mount effect below, so depending on state here would refetch on every toggle.
    const filterRef = useRef<OnlineRecipeFilter>(filter)

    const setLoadingState = (value: boolean) => {
        loadingRef.current = value
        setLoading(value)
    }

    const getPage = useCallback(
        async (pageNumber: number) => {
            if (loadingRef.current) return
            if (isSearching) return

            setLoadingState(true)

            try {
                const response = await onlineRecipesClient.getOnlineRecipes(filterRef.current, pageNumber)

                if (response) {
                    setPage(response.page)
                    setMaxPages(response.maxPages)
                    setTotalRecipes(response.totalRecipes)
                    setHeaderText("online-recipes", `${response.totalRecipes} Recipes`)

                    if (pageNumber === 0) {
                        setRecipes(response.recipes)
                    } else {
                        setRecipes((prev) => [...prev, ...response.recipes])
                    }
                }
            } finally {
                setLoadingState(false)
            }
        },
        [isSearching, setHeaderText]
    )

    const search = useCallback(
        async (q: string, pageNumber = 1) => {
            if (loadingRef.current) return

            if (!q.trim()) {
                setQuery("")
                setIsSearching(false)
                setHeaderText("online-recipes", null)
                setRecipes([])
                await getPage(0)
                return
            }

            setLoadingState(true)
            setIsSearching(true)
            setQuery(q)

            try {
                const response = await onlineRecipesClient.searchOnlineRecipes(q, filterRef.current, pageNumber)

                if (response) {
                    setPage(response.page)
                    setMaxPages(response.maxPages)
                    setTotalRecipes(response.totalRecipes)
                    setHeaderText("online-recipes", `${response.totalRecipes} Recipes`)

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
        [getPage, setHeaderText]
    )

    const getNextPage = useCallback(async () => {
        if (loadingRef.current) return
        if (page >= maxPages - 1) return

        if (isSearching) {
            await search(query, page + 1)
        } else {
            await getPage(page + 1)
        }
    }, [page, maxPages, isSearching, query, search, getPage])

    // Reload from the first page so the current filters apply to the whole list.
    const applyFilter = useCallback(
        (next: OnlineRecipeFilter) => {
            filterRef.current = next
            setFilter(next)

            if (isSearching) {
                search(query, 1)
            } else {
                getPage(0)
            }
        },
        [isSearching, query, search, getPage]
    )

    const updateQuery = (q: string) => {
        setQuery(q)

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }

        debounceTimeout.current = setTimeout(async () => {
            await search(q, 1)
        }, 500)
    }

    useEffect(() => {
        getPage(0)
    }, [getPage])

    const pinnedUrls = useMemo(() => viewLater.map((recipe) => recipe.url), [viewLater])
    const orderedRecipes = useMemo(() => pinFirst(recipes, pinnedUrls), [recipes, pinnedUrls])

    return {
        states: {
            recipes: orderedRecipes,
            page,
            maxPages,
            totalRecipes,
            loading,
            style,
            query,
            isSearching,
            filter,
        },
        actions: {
            getNextPage,
            setStyle,
            search,
            updateQuery,
            setFilters: applyFilter,
        },
    }
}
