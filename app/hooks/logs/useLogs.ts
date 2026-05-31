import { useCallback, useEffect, useState } from "react"
import { Log } from "@/types/logs"
import { logsClient } from "@/lib/logs"

export function useLogs() {
    const [loadingGet, setLoadingGet] = useState<boolean>(false)
    const [loadingDelete, setLoadingDelete] = useState<boolean>(false)
    const [logs, setLogs] = useState<Log[]>([])

    const getLogs = useCallback(async () => {
        setLoadingGet(true)

        const response = await logsClient.getLogs()
        if (response) {
            setLogs(response.reverse())
        }

        setLoadingGet(false)
    }, [])

    const deleteLogs = useCallback(async () => {
        setLoadingDelete(true)

        const response = await logsClient.deleteLogs()
        if (response) {
            setLogs([])
        }

        setLoadingDelete(false)
    }, [])

    useEffect(() => {
        getLogs()
    }, [])

    return {
        states: {
            logs,
            loadingGet,
            loadingDelete,
        },
        actions: {
            deleteLogs,
            getLogs,
        },
    }
}
