import { User } from "@/types/index"

export type Action = "create" | "delete" | "get" | "update"

export type Log = {
    date: string
    text: string
    user: User
    action: Action
    error?: boolean | null
}

export type GetAppLogsResponse = Log[]

export type CreateAppLogRequest = {
    date?: string | null
    text: string
    user: User
    action: Action
    error?: boolean | null
}

export type CreateAppLogResponse = Log

export type DeleteAppLogResponse = {
    message: string
}
