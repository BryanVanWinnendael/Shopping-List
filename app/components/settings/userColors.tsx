import { StyleSheet, Text, View } from "react-native"
import { Users } from "lucide-react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { USERS_ARRAY } from "@/lib/constants"
import Accordion from "@/components/accordion"
import UserColor from "@/components/settings/userColor"
import CustomSwitch from "@/components/customSwitch"
import useThemes from "@/hooks/themes/useThemes"

export default function UserColors() {
    const { vars, theme } = useThemes()
    const { setUserColors, userColors } = useSettingsStore()

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
                        <Users size={18} color={vars.accentColor} />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: vars.textColor }]}>User Colors</Text>

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

            <Accordion expanded={userColors.enabled} style={{ marginTop: 20 }}>
                <View style={{ gap: 12 }}>
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
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },
})
