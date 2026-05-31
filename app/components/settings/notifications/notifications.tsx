import React from "react"
import { StyleSheet, Text, View } from "react-native"
import Accordion from "@/components/accordion"
import SettingRow from "@/components/settings/notifications/settingsRow"
import { useNotifications } from "@/hooks/notifications/useNotifications"
import CustomSwitch from "@/components/customSwitch"
import useThemes from "@/hooks/themes/useThemes"
import { Bell, BellRing } from "lucide-react-native"

export default function Notifications() {
    const { vars, theme } = useThemes()
    const { states, actions } = useNotifications()

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderColor: vars.secondaryBorderColor,
                },
            ]}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <View
                        style={[
                            styles.iconWrapper,
                            {
                                backgroundColor: `${vars.accentColor}20`,
                            },
                        ]}
                    >
                        {states.masterEnabled ? (
                            <BellRing size={18} color={vars.accentColor} />
                        ) : (
                            <Bell size={18} color={vars.accentColor} />
                        )}
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: vars.textColor }]}>Notifications</Text>

                        <Text
                            style={{
                                color: theme === "light" ? "#6b7280" : "#9ca3af",
                                marginTop: 2,
                                fontSize: 13,
                            }}
                        >
                            Manage app notification preferences
                        </Text>
                    </View>
                </View>

                <CustomSwitch
                    key={String(states.masterEnabled)}
                    value={states.masterEnabled}
                    onChange={actions.toggleMaster}
                />
            </View>

            <Accordion expanded={states.masterEnabled} style={{ marginTop: 20 }}>
                <View style={{ gap: 12 }}>
                    <SettingRow
                        label="Notify on Added"
                        description="Receive a notification whenever a new product is added."
                        value={states.subscribedNotifications.added}
                        onToggle={() => actions.toggle("added")}
                    />

                    <SettingRow
                        label="Notify on Removed"
                        description="Receive a notification whenever a product is removed."
                        value={states.subscribedNotifications.removed}
                        onToggle={() => actions.toggle("removed")}
                    />

                    <SettingRow
                        label="Notify Weekly"
                        description="Receive reminders for products still in your list and notifications when weekly products are added."
                        value={states.subscribedNotifications.timed}
                        onToggle={() => actions.toggle("timed")}
                    />
                </View>
            </Accordion>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        marginHorizontal: 8,
        paddingHorizontal: 18,
        paddingTop: 18,
        borderWidth: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 14,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
})
