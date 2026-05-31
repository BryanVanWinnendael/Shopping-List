import { User } from "@/types/index"

export type NotificationTypes = "added" | "timed" | "removed"

export type Notification = {
    id: string
    user: User
    type: NotificationTypes
    token: string
}

export type CreateNotificationRequest = {
    user: User
    type: NotificationTypes
    token: string
}

export type CreateNotificationResponse = Notification

export type GetUserNotificationsResponse = Notification[]

export type PushUserNotificationByTypeRequest = {
    env?: string | null
}

export type PushUserNotificationByTypeResponse = {
    message: string
    type: NotificationTypes
    user: User
}

export type DeleteUserNotificationResponse = {
    message: string
    type: NotificationTypes
    user: User
}

export type NotificationSettings = {
    added: boolean
    timed: boolean
    removed: boolean
    expoToken?: string | null
}
