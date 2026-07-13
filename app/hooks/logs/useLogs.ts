import { useCallback, useEffect, useRef, useState } from "react"
import { logsClient } from "@/lib/logs"
import { Trace } from "@/types/generated/models/trace"
import { useHeaderStore } from "@/stores/useHeaderStore"

export function useLogs() {
    const { setText } = useHeaderStore()

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
    const loadingRef = useRef(false)

    const [traces, setTraces] = useState<Trace[]>([])
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(0)
    const [totalTraces, setTotalTraces] = useState(0)
    const [hasNext, setHasNext] = useState(false)

    const [loading, setLoading] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const [query, setQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)

    const setLoadingState = (value: boolean) => {
        loadingRef.current = value
        setLoading(value)
    }

    const getLogs = useCallback(
        async (pageNumber = 1) => {
            if (loadingRef.current) return
            if (isSearching) return

            setLoadingState(true)

            try {
                const response = await logsClient.getLogs(pageNumber)

                if (response) {
                    setPage(response.page)
                    setPageSize(response.pageSize)
                    setTotalTraces(response.totalTraces ?? 0)
                    setText(`${response.totalTraces} Logs`)
                    setHasNext(response.hasNext)

                    if (pageNumber === 1) {
                        setTraces(response.traces)
                    } else {
                        setTraces((prev) => [...prev, ...response.traces])
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
                setText(null)
                setTraces([])
                setTotalTraces(0)
                await getLogs(1)
                return
            }

            setLoadingState(true)
            setIsSearching(true)
            setQuery(q)

            try {
                const response = await logsClient.searchLogs(q, pageNumber)

                if (response) {
                    setPage(response.page)
                    setPageSize(response.pageSize)
                    setTotalTraces(response.totalTraces ?? 0)
                    setText(`${response.totalTraces} Logs`)
                    setHasNext(response.hasNext)

                    if (pageNumber === 1) {
                        setTraces(response.traces)
                    } else {
                        setTraces((prev) => [...prev, ...response.traces])
                    }
                }
            } finally {
                setLoadingState(false)
            }
        },
        [getLogs, setText]
    )

    const getNextPage = useCallback(async () => {
        if (loading) return
        if (!hasNext) return

        if (isSearching) {
            await search(query, page + 1)
        } else {
            await getLogs(page + 1)
        }
    }, [page, hasNext, loading, isSearching, query, search, getLogs])

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
        getLogs(1)
    }, [getLogs])

    const refresh = useCallback(async () => {
        setRefreshing(true)

        try {
            if (isSearching) {
                await search(query, 1)
            } else {
                await getLogs(1)
            }
        } finally {
            setRefreshing(false)
        }
    }, [isSearching, query, search, getLogs])

    const deleteLogs = useCallback(async () => {
        setLoadingDelete(true)

        try {
            const response = await logsClient.deleteLogs()

            if (response) {
                setTraces([])
                setPage(1)
                setPageSize(0)
                setTotalTraces(0)
                setHasNext(false)
            }
        } finally {
            setLoadingDelete(false)
        }
    }, [])

    useEffect(() => {
        getLogs(1)
    }, [getLogs])

    return {
        states: {
            traces,
            page,
            pageSize,
            totalTraces,
            hasNext,
            loading,
            loadingDelete,
            refreshing,
            query,
            isSearching,
        },
        actions: {
            getLogs,
            search,
            getNextPage,
            updateQuery,
            clearSearch,
            refresh,
            deleteLogs,
        },
    }
}
