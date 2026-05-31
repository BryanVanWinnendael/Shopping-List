import {useState} from "react"
import {useSettingsStore} from "@/stores/useSettingsStore"
import {notificationsClient, registerForPush} from "@/lib/notifications"
import {useNotificationsStore} from "@/stores/useNotificationsStore"
import {NotificationTypes} from "@/types/notifications"

export function useNotifications() {
    const { setNotificationPushed, notificationPushed, setSubscribedNotifications, subscribedNotifications } =
        useNotificationsStore()
    const { user } = useSettingsStore()

    const [manualMaster, setManualMaster] = useState(false)
    const anySubscribed =
        subscribedNotifications.timed || subscribedNotifications.added || subscribedNotifications.removed
    const masterEnabled = manualMaster || anySubscribed

    const updateNotifications = (data: Partial<typeof subscribedNotifications>) => {
        setSubscribedNotifications({ ...subscribedNotifications, ...data })
    }

    const toggleMaster = async (value: boolean) => {
        if (!user) return
        setManualMaster(value)

        if (value) {
            const token = await registerForPush()
            if (token) {
                updateNotifications({ expoToken: token })
            } else setManualMaster(false)
            return
        }

        const keys: NotificationTypes[] = ["added", "timed", "removed"]

        await Promise.all(
            keys.map((k) => {
                if (user && subscribedNotifications[k]) {
                    notificationsClient.deleteNotification(user, k)
                }
            })
        )

        notificationsClient.deleteNotification(user, "general")

        updateNotifications({
            added: false,
            timed: false,
            removed: false,
            expoToken: null,
        })
    }

    const toggle = async (key: NotificationTypes) => {
        const newValue = !subscribedNotifications[key]
        updateNotifications({ [key]: newValue })

        let token = subscribedNotifications.expoToken

        if (newValue) {
            if (!token) {
                token = await registerForPush()
                if (token) updateNotifications({ expoToken: token })
            }

            if (token && user) {
                await notificationsClient.createNotification({
                    user,
                    type: key,
                    token,
                })
            }
        } else if (user) {
            await notificationsClient.deleteNotification(user, key)
        }
    }

    const pushNotification = async (type: NotificationTypes) => {
        if (!user || notificationPushed) return
        const response = await notificationsClient.pushNotification(type, user)
        if (response) {
            setNotificationPushed(true)
        }
    }

    return {
        states: {
            masterEnabled,
            subscribedNotifications,
        },
        actions: {
            toggleMaster,
            toggle,
            pushNotification,
        },
    }
}
