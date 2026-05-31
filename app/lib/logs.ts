import { getUser } from "./user"
import { httpRequest } from "./httpHelper"
import {
    Action,
    CreateAppLogRequest,
    CreateAppLogResponse,
    DeleteAppLogResponse,
    GetAppLogsResponse,
} from "@/types/logs"
import Toast from "react-native-toast-message"

const LOGS_PATH = "logs/app"

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
    action: Action,
    text: string,
    error: boolean = false
): Promise<CreateAppLogResponse | null> => {
    try {
        const date = formatDate(new Date())
        const user = await getUser()
        const request: CreateAppLogRequest = {
            text: text,
            action: action,
            user: user,
            date: date,
            error: error,
        }

        const response = await httpRequest<CreateAppLogResponse>({
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
        return null
    }
}

const getLogs = async (): Promise<GetAppLogsResponse | null> => {
    try {
        const response = await httpRequest<GetAppLogsResponse>({
            url: LOGS_PATH,
            method: "GET",
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

const deleteLogs = async (): Promise<DeleteAppLogResponse | null> => {
    try {
        const response = await httpRequest<DeleteAppLogResponse>({
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

export const logsClient = {
    createLog,
    getLogs,
    deleteLogs,
}
