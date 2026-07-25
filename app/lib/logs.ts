import { httpRequest } from "./httpHelper"
import Toast from "react-native-toast-message"
import uuid from "react-native-uuid"
import { ungzip } from "pako"
import { Action } from "@/types/generated/models/action"
import {
    CreateLogRequest,
    CreateLogResponse,
    DeleteLogResponse,
    GetLogsResponse,
    SearchLogsResponse,
} from "@/types/generated/contracts/logs"

const LOGS_PATH = "logs"

const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }
    const timeString = date.toLocaleTimeString([], options)
    const dateString = date.toLocaleDateString()
    return `${timeString} ${dateString}`
}

const createLog = async (
    responseBody: string,
    action: Action,
    error: boolean = false
): Promise<CreateLogResponse | null> => {
    try {
        const request: CreateLogRequest = {
            dateTime: new Date().toISOString(),
            text: error ? "Firebase request failed" : "Firebase request completed",
            service: "App",
            path: "Firebase",
            traceId: uuid.v4(),
            httpMethod: action,
            responseBody: responseBody,
            error,
            phase: "REQUEST",
        }

        const response = await httpRequest<CreateLogResponse>({
            url: LOGS_PATH,
            method: "POST",
            body: request,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to create log",
        })
        console.error(error)
        return null
    }
}

const getLogs = async (pageNumber: number): Promise<GetLogsResponse | null> => {
    try {
        const params: Record<string, any> = { page: pageNumber }
        const response = await httpRequest<GetLogsResponse>({
            url: LOGS_PATH,
            method: "GET",
            params,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to get logs",
        })
        return null
    }
}

const deleteLogs = async (): Promise<DeleteLogResponse | null> => {
    try {
        const response = await httpRequest<DeleteLogResponse>({
            url: LOGS_PATH,
            method: "DELETE",
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to delete logs",
        })
        return null
    }
}

const searchLogs = async (query: string, page: number): Promise<SearchLogsResponse | null> => {
    const params: Record<string, any> = { query, page }

    try {
        const response = await httpRequest<SearchLogsResponse>({
            url: `${LOGS_PATH}/search`,
            method: "GET",
            params,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to search logs",
        })
        return null
    }
}

export function decompress(text: string) {
    const binary = atob(text)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    try {
        return ungzip(bytes, { toText: true })
    } catch (error) {
        console.error("decompress failed:", error)
        return null
    }
}

export const logsClient = {
    createLog,
    getLogs,
    deleteLogs,
    searchLogs,
}
