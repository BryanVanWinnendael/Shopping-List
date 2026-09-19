import { create } from "zustand"
import { getSubscribedNotifications } from "@/lib/notifications"
import { NotificationSettings } from "@/types/notifications"

type NotificationsState = {
    notificationPushed: boolean
    subscribedNotifications: NotificationSettings

    setNotificationPushed: (val: boolean) => void
    loadNotifications: () => Promise<void>
    setSubscribedNotifications: (notifications: NotificationSettings) => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
    notificationPushed: false,
    subscribedNotifications: {
        added: false,
        removed: false,
        timed: false,
        expoToken: null,
    },

    loadNotifications: async () => {
        const current = get().subscribedNotifications
        if (current.expoToken !== null) {
            return
        }

        const storedNotifications = await getSubscribedNotifications()
        if (storedNotifications !== null) {
            set({ subscribedNotifications: storedNotifications })
        }
    },

    setNotificationPushed: (val: boolean) => {
        set({ notificationPushed: val })
    },

    setSubscribedNotifications: async (val: NotificationSettings) => {
        set({ subscribedNotifications: val })
    },
}))
