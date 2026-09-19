import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Bell, BellRing } from "lucide-react-native"
import { GlassView } from "expo-glass-effect"

import Accordion from "@/components/accordion"
import SettingRow from "@/components/settings/notifications/settingsRow"
import { useNotifications } from "@/hooks/notifications/useNotifications"
import CustomSwitch from "@/components/customSwitch"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"

export default function Notifications() {
    const { vars, theme } = useThemes()
    const { states, actions } = useNotifications()

    const colorScheme = theme === "light" ? "light" : "dark"

    return (
        <GlassView
            glassEffectStyle="regular"
            colorScheme={colorScheme}
            tintColor={vars.secondaryBackgroundColor}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <GlassView
                        glassEffectStyle="regular"
                        colorScheme={colorScheme}
                        isInteractive={false}
                        style={styles.iconGlass}
                    >
                        <View style={styles.iconWrapper}>
                            {states.masterEnabled ? (
                                <BellRing size={18} strokeWidth={2} color={vars.accentColor} />
                            ) : (
                                <Bell size={18} strokeWidth={2} color={vars.accentColor} />
                            )}
                        </View>
                    </GlassView>

                    <View style={styles.textContainer}>
                        <Text
                            style={[
                                styles.title,
                                {
                                    color: vars.textColor,
                                },
                            ]}
                        >
                            Notifications
                        </Text>

                        <Text
                            style={[
                                styles.subtitle,
                                {
                                    color: theme === "light" ? "#6b7280" : "#9ca3af",
                                },
                            ]}
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

            <Accordion expanded={states.masterEnabled} style={styles.accordion}>
                <View style={styles.settingsList}>
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
        </GlassView>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS_L,
        marginHorizontal: 8,
        paddingHorizontal: 18,
        paddingTop: 18,
        overflow: "hidden",
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
    textContainer: {
        flex: 1,
    },
    iconGlass: {
        width: 42,
        height: 42,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: BORDER_RADIUS_FULL,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    accordion: {
        marginTop: 20,
    },
    settingsList: {
        gap: 12,
    },
})
