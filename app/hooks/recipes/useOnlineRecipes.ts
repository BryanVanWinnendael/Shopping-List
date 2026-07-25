import { useCallback, useEffect, useRef, useState } from "react"
import { onlineRecipesClient } from "@/lib/online-recipes"
import { OnlineRecipe } from "@/types/generated/models/online_recipe"
import { useHeaderStore } from "@/stores/useHeaderStore"

export default function useOnlineRecipes() {
    const { setText } = useHeaderStore()

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
                const response = await onlineRecipesClient.getOnlineRecipes(pageNumber)

                if (response) {
                    setPage(response.page)
                    setMaxPages(response.maxPages)
                    setTotalRecipes(response.totalRecipes)
                    setText("online-recipes", `${response.totalRecipes} Recipes`)

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
        [isSearching, setText]
    )

    const search = useCallback(
        async (q: string, pageNumber = 1) => {
            if (loadingRef.current) return

            if (!q.trim()) {
                setQuery("")
                setIsSearching(false)
                setText("online-recipes", null)
                setRecipes([])
                await getPage(0)
                return
            }

            setLoadingState(true)
            setIsSearching(true)
            setQuery(q)

            try {
                const response = await onlineRecipesClient.searchOnlineRecipes(q, pageNumber)

                if (response) {
                    setPage(response.page)
                    setMaxPages(response.maxPages)
                    setTotalRecipes(response.totalRecipes)
                    setText("online-recipes", `${response.totalRecipes} Recipes`)

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
        [getPage, setText]
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

    const updateQuery = (q: string) => {
        setQuery(q)

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }

        debounceTimeout.current = setTimeout(async () => {
            await search(q, 1)
        }, 500)
    }

    const clearSearch = useCallback(() => {
        setQuery("")
        setIsSearching(false)
        getPage(0)
    }, [getPage])

    useEffect(() => {
        getPage(0)
    }, [getPage])

    return {
        states: {
            recipes,
            page,
            maxPages,
            totalRecipes,
            loading,
            style,
            query,
            isSearching,
        },
        actions: {
            getNextPage,
            setStyle,
            search,
            clearSearch,
            updateQuery,
        },
    }
}
