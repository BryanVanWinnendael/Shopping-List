import { useCallback, useEffect, useRef, useState } from "react"
import { OnlineRecipe } from "@/types/recipes"
import { onlineRecipesClient } from "@/lib/online-recipes"
import { useRecipesStore } from "@/stores/useRecipesStore"

export default function useOnlineRecipes() {
    const { setOnlineRecipes } = useRecipesStore()

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

    const [recipes, setRecipes] = useState<OnlineRecipe[]>([])
    const [page, setPage] = useState(0)
    const [maxPages, setMaxPages] = useState(0)
    const [totalRecipes, setTotalRecipes] = useState(0)

    const [loading, setLoading] = useState(false)
    const [style, setStyle] = useState<"list" | "grid">("list")

    const [query, setQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)

    const getPage = useCallback(
        async (pageNumber: number) => {
            if (loading) return
            if (isSearching) return

            setLoading(true)

            const response = await onlineRecipesClient.getOnlineRecipes(pageNumber)

            if (response) {
                setPage(response.page)
                setMaxPages(response.maxPages)
                setTotalRecipes(response.totalRecipes)
                setOnlineRecipes(response.totalRecipes)

                if (pageNumber === 0) {
                    setRecipes(response.recipes)
                } else {
                    setRecipes((prev) => [...prev, ...response.recipes])
                }
            }

            setLoading(false)
        },
        [isSearching]
    )

    const search = useCallback(async (q: string, pageNumber = 1) => {
        if (loading) return

        if (!q.trim()) {
            setOnlineRecipes(0)
            setRecipes([])
            return
        }

        setLoading(true)
        setIsSearching(true)
        setQuery(q)

        const response = await onlineRecipesClient.searchOnlineRecipes(q, pageNumber)

        if (response) {
            setPage(response.page)
            setMaxPages(response.maxPages)
            setTotalRecipes(response.totalRecipes)
            setOnlineRecipes(response.totalRecipes)

            if (pageNumber === 1) {
                setRecipes(response.recipes)
            } else {
                setRecipes((prev) => [...prev, ...response.recipes])
            }
        }

        setLoading(false)
    }, [])

    const getNextPage = useCallback(async () => {
        if (loading) return
        if (page >= maxPages - 1) return

        if (isSearching) {
            await search(query, page + 1)
        } else {
            await getPage(page + 1)
        }
    }, [page, maxPages, loading, isSearching, query, search, getPage])

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
