import { useState } from "react"
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Linking,
  Alert,
  ViewStyle,
  StyleProp,
} from "react-native"
import * as Notifications from "expo-notifications"
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"
import { useSettings } from "@/stores/useSettings"
import {
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { addNotification, deleteNotification } from "@/lib/notifications"
import { createLogs } from "@/lib/logs"
import { NotificationTypes } from "@/types"
import { useInteractions } from "@/stores/useInteractions"

type Props = {
  expanded: boolean
  children: React.ReactNode
  duration?: number
  style?: StyleProp<ViewStyle>
}

function AccordionItem({ expanded, children, duration = 350, style }: Props) {
  const contentHeight = useSharedValue(0)
  const animatedHeight = useDerivedValue(() =>
    withTiming(expanded ? contentHeight.value : 0, { duration }),
  )
  const rStyle = useAnimatedStyle(() => ({ height: animatedHeight.value }))

  return (
    <Animated.View style={[rStyle, { overflow: "hidden" }, style]}>
      <View
        style={{ position: "absolute", width: "100%", paddingBottom: 16 }}
        onLayout={(e) => (contentHeight.value = e.nativeEvent.layout.height)}
      >
        {children}
      </View>
    </Animated.View>
  )
}

async function registerForPush() {
  try {
    const { status, ios } = await Notifications.getPermissionsAsync()

    let finalStatus = status

    if (ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      finalStatus = Notifications.PermissionStatus.GRANTED
    }

    if (finalStatus === Notifications.PermissionStatus.DENIED) {
      Alert.alert(
        "Enable Notifications",
        "To receive notifications, please enable them in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      )
      return null
    }

    if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
      const requestResult = await Notifications.requestPermissionsAsync()
      finalStatus = requestResult.status
    }

    if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
      await createLogs("add", "not granted push notification permissions")
      return null
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data

    return token
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error)
    await createLogs("add", errorMessage)
    return null
  }
}

export default function NotificationsAccordion() {
  const { theme, aColor, notifications, setNotifications, user } = useSettings()
  const { setError } = useInteractions()

  const [manualMaster, setManualMaster] = useState(false)

  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

  const update = (data: Partial<typeof notifications>) => {
    setNotifications({ ...notifications, ...data })
  }

  const anySubscribed =
    notifications.added || notifications.timed || notifications.removed
  const masterEnabled = manualMaster || anySubscribed

  const onMasterToggle = async (val: boolean) => {
    setManualMaster(val)

    if (val) {
      const token = await registerForPush()
      if (token) update({ expoToken: token })
      if (!token) setManualMaster(false)
    } else {
      const types: (keyof typeof notifications)[] = [
        "added",
        "timed",
        "removed",
      ]

      const deletionPromises = types.map((key) => {
        if (user && notifications[key]) {
          const success = deleteNotification(user, key)
          if (!success) {
            setError("Failed to delete notification")
          }
        }
        return Promise.resolve()
      })
      await Promise.all(deletionPromises)

      update({
        added: false,
        timed: false,
        removed: false,
        expoToken: null,
      })
    }
  }

  const toggle = async (key: NotificationTypes) => {
    const newValue = !notifications[key]
    update({ [key]: newValue })

    let token = notifications.expoToken

    if (newValue) {
      if (!token) {
        token = await registerForPush()
        if (token) update({ expoToken: token })
      }

      if (token && user) {
        const success = await addNotification({
          user,
          type: key,
          token,
        })
        if (!success) setError("Failed to enable notification")
      }
    } else {
      if (user) {
        const success = await deleteNotification(user, key)
        if (!success) setError("Failed to enable notification")
      }
    }

    const anyEnabled = Object.keys({ ...notifications, [key]: newValue }).some(
      (k) =>
        k !== "expoToken" &&
        (notifications[k as keyof typeof notifications] || k === key),
    )
    if (newValue && anyEnabled && !notifications.expoToken) {
      const token = await registerForPush()
      if (token) update({ expoToken: token })
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: secondaryBackgroundColor,
          borderColor: borderColor,
          borderWidth: 0.2,
        },
      ]}
    >
      <View style={styles.masterRow}>
        <Text style={[styles.headerText, { color: textColor }]}>
          Enable Notifications
        </Text>
        <Switch
          value={masterEnabled}
          onValueChange={onMasterToggle}
          trackColor={{ false: "#767577", true: aColor }}
          thumbColor={masterEnabled ? "#fff" : "#f4f3f4"}
          ios_backgroundColor="#767577"
        />
      </View>

      <AccordionItem expanded={masterEnabled} style={{ marginTop: 16 }}>
        <SettingRow
          label="Notify on Added"
          description="Receive a notification whenever a new item is added."
          value={notifications.added}
          toggle={() => toggle("added")}
          text={textColor}
          aColor={aColor}
        />
        <SettingRow
          label="Notify on Removed"
          description="Receive a notification whenever an item is removed."
          value={notifications.removed}
          toggle={() => toggle("removed")}
          text={textColor}
          aColor={aColor}
        />
        <SettingRow
          label="Notify on Weekly Added"
          description="Receive a notification whenever a weekly item is added."
          value={notifications.timed}
          toggle={() => toggle("timed")}
          text={textColor}
          aColor={aColor}
        />
      </AccordionItem>
    </View>
  )
}

function SettingRow({
  label,
  value,
  toggle,
  text,
  aColor,
  description,
}: {
  label: string
  value: boolean
  toggle: () => void
  text: string
  aColor: string
  description?: string
}) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={[styles.rowTitle, { color: text }]}>{label}</Text>
        {description && (
          <Text
            style={[
              styles.helperText,
              { color: text === "#000" ? "#6b7280" : "#a1a9b1" },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={toggle}
        trackColor={{ false: "#767577", true: aColor }}
        ios_backgroundColor="#767577"
        thumbColor={value ? "#fff" : "#f4f3f4"}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginHorizontal: 8,
    paddingHorizontal: 16,
  },
  masterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  headerText: {
    fontWeight: "600",
    fontSize: 16,
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  rowTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  textBlock: {
    flex: 1,
    marginRight: 8,
  },
  helperText: {
    fontSize: 12,
    marginTop: 2,
  },
})
