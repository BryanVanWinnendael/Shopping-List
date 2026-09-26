import { StyleSheet, Text, View } from "react-native"
import { Users } from "lucide-react-native"
import { GlassView } from "expo-glass-effect"

import { useSettingsStore } from "@/stores/useSettingsStore"
import { USERS_ARRAY } from "@/lib/constants"
import Accordion from "@/components/accordion"
import UserColor from "@/components/settings/userColor"
import CustomSwitch from "@/components/customSwitch"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"

export default function UserColors() {
    const { vars, theme } = useThemes()
    const { setUserColors, userColors } = useSettingsStore()

    const colorScheme = theme === "light" ? "light" : "dark"

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderColor: vars.secondaryBorderColor,
                    borderWidth: 1,
                },
            ]}
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
                            <Users size={18} strokeWidth={2} color={vars.accentColor} />
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
                            User Colors
                        </Text>

                        <Text
                            style={[
                                styles.subtitle,
                                {
                                    color: theme === "light" ? "#6b7280" : "#9ca3af",
                                },
                            ]}
                        >
                            Enable custom label colors for each user
                        </Text>
                    </View>
                </View>

                <CustomSwitch
                    value={userColors.enabled}
                    onChange={(val) =>
                        setUserColors({
                            ...userColors,
                            enabled: val,
                        })
                    }
                />
            </View>

            <Accordion expanded={userColors.enabled} style={styles.accordion}>
                <View style={styles.userList}>
                    {USERS_ARRAY.map((user, index) => (
                        <UserColor user={user} key={index} />
                    ))}
                </View>
            </Accordion>
        </View>
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
    userList: {
        gap: 12,
    },
})
