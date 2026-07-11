import { useCallback, useEffect, useRef, useState } from "react"
import { logsClient } from "@/lib/logs"
import { Trace } from "@/types/generated/models/trace"

export function useLogs() {
    const [loading, setLoading] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [traces, setTraces] = useState<Trace[]>([])
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(0)
    const [totalTraces, setTotalTraces] = useState(0)
    const [hasNext, setHasNext] = useState(false)

    const loadingMore = useRef(false)

    const getLogs = useCallback(async (pageNumber = 1) => {
        if (loadingMore.current) return

        loadingMore.current = true
        setLoading(true)

        try {
            const response = await logsClient.getLogs(pageNumber)

            if (!response) return

            setTraces((prev) => (pageNumber === 1 ? response.traces : [...prev, ...response.traces]))

            setPage(response.page)
            setPageSize(response.pageSize)
            setTotalTraces(response.totalTraces ?? 0)
            setHasNext(response.hasNext)
        } finally {
            loadingMore.current = false
            setLoading(false)
        }
    }, [])

    const refresh = useCallback(async () => {
        if (refreshing) return

        setRefreshing(true)

        try {
            await getLogs(1)
        } finally {
            setRefreshing(false)
        }
    }, [getLogs, refreshing])

    const loadNextPage = useCallback(() => {
        if (loadingMore.current || !hasNext) return

        getLogs(page + 1)
    }, [getLogs, hasNext, page])

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
        },
        actions: {
            getLogs,
            loadNextPage,
            refresh,
            deleteLogs,
        },
    }
}
