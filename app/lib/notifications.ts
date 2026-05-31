import { httpRequest } from "./httpHelper"
import { IS_DEV } from "./constants"
import {
    CreateNotificationRequest,
    CreateNotificationResponse,
    DeleteUserNotificationResponse,
    GetUserNotificationsResponse,
    NotificationSettings,
    NotificationTypes,
    PushUserNotificationByTypeRequest,
    PushUserNotificationByTypeResponse,
} from "@/types/notifications"
import * as Notifications from "expo-notifications"
import { Alert, Linking } from "react-native"
import { User } from "@/types"
import Toast from "react-native-toast-message"
import { getUser } from "@/lib/user"

const NOTIFICATIONS_PATH = "notifications"

const createNotification = async (request: CreateNotificationRequest): Promise<CreateNotificationResponse | null> => {
    try {
        const response = await httpRequest<CreateNotificationResponse>({
            url: NOTIFICATIONS_PATH,
            method: "POST",
            body: request,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to subscribe to notification",
        })
        return null
    }
}

const deleteNotification = async (user: User, type: string): Promise<DeleteUserNotificationResponse | null> => {
    try {
        const response = await httpRequest<DeleteUserNotificationResponse>({
            url: `${NOTIFICATIONS_PATH}/${user}/${type}`,
            method: "DELETE",
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to unsubscribe notification",
        })
        return null
    }
}

const pushNotification = async (
    type: NotificationTypes,
    user: User
): Promise<PushUserNotificationByTypeResponse | null> => {
    const request: PushUserNotificationByTypeRequest = {
        env: IS_DEV ? "dev" : "prod",
    }

    try {
        const response = await httpRequest<PushUserNotificationByTypeResponse>({
            url: `${NOTIFICATIONS_PATH}/push/${type}/${user}`,
            method: "POST",
            body: request,
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to push notification",
        })
        return null
    }
}

const getUserNotifications = async (user: string): Promise<GetUserNotificationsResponse | null> => {
    try {
        const response = await httpRequest<GetUserNotificationsResponse>({
            url: `${NOTIFICATIONS_PATH}/users/${user}`,
            method: "GET",
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to get subscribed notifications",
        })
        return null
    }
}

export const registerForPush = async (): Promise<string | null> => {
    try {
        const { status, ios } = await Notifications.getPermissionsAsync()

        let finalStatus = status

        if (ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
            finalStatus = Notifications.PermissionStatus.GRANTED
        }

        if (finalStatus === Notifications.PermissionStatus.DENIED) {
            Alert.alert("Enable Notifications", "To receive notifications, please enable them in Settings.", [
                { text: "Cancel", style: "cancel" },
                { text: "Open Settings", onPress: () => Linking.openSettings() },
            ])
            return null
        }

        if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
            const request = await Notifications.requestPermissionsAsync()
            finalStatus = request.status
        }

        if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
            Toast.show({
                type: "error",
                text1: "Error: Failed to enable notifications",
            })
            return null
        }

        return (await Notifications.getExpoPushTokenAsync()).data
    } catch (e) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to enable notifications",
        })
        return null
    }
}

export const getSubscribedNotifications = async (): Promise<NotificationSettings> => {
    const defaultState: NotificationSettings = {
        added: false,
        removed: false,
        timed: false,
        expoToken: null,
    }

    try {
        const user = await getUser()
        if (!user || user === "None") {
            return defaultState
        }

        const userNotifications = await notificationsClient.getUserNotifications(user)

        if (!Array.isArray(userNotifications) || userNotifications.length === 0) {
            return defaultState
        }

        const notifications = userNotifications.reduce(
            (acc, notif) => {
                const type = notif.type as NotificationTypes

                if (type in acc) {
                    acc[type] = true
                }

                return acc
            },
            { ...defaultState }
        )

        notifications.expoToken = userNotifications[0]?.token ?? null

        return notifications
    } catch (error) {
        return defaultState
    }
}

export const notificationsClient = {
    createNotification,
    deleteNotification,
    pushNotification,
    getUserNotifications,
}
