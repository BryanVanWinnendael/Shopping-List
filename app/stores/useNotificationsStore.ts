import { create } from "zustand"
import { NotificationSettings } from "@/types/notifications"
import { getSubscribedNotifications } from "@/lib/notifications"

type NotificationsState = {
    notificationPushed: boolean
    subscribedNotifications: NotificationSettings

    setNotificationPushed: (val: boolean) => void
    loadNotifications: () => Promise<void>
    setSubscribedNotifications: (notifications: NotificationSettings) => void
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
    notificationPushed: false,
    subscribedNotifications: {
        added: false,
        removed: false,
        timed: false,
        expoToken: null,
    },

    loadNotifications: async () => {
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
