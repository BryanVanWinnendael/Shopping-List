import { StyleSheet, Text, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { setAppIconSafe } from "@/lib/appIcon"
import CustomSwitch from "@/components/customSwitch"
import useThemes from "@/hooks/themes/useThemes"
import { Wand2 } from "lucide-react-native"

export default function NewUI() {
    const { vars, theme } = useThemes()
    const { setNewUI, newUI } = useSettingsStore()

    const handleChangeUI = async (useNewUI: boolean) => {
        if (useNewUI) {
            setNewUI(true)
            await setAppIconSafe("new", false)
        } else {
            setNewUI(false)
            await setAppIconSafe("old", false)
        }
    }

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
            <View style={styles.row}>
                <View style={styles.titleContainer}>
                    <View
                        style={[
                            styles.iconWrapper,
                            {
                                backgroundColor: `${vars.accentColor}20`,
                            },
                        ]}
                    >
                        <Wand2 size={18} color={vars.accentColor} />
                    </View>

                    <View style={styles.textBlock}>
                        <Text style={[styles.title, { color: vars.textColor }]}>New UI</Text>

                        <Text
                            style={[
                                styles.description,
                                {
                                    color: theme === "light" ? "#6b7280" : "#9ca3af",
                                },
                            ]}
                        >
                            Uses Liquid Glass design for various UI elements.
                        </Text>
                    </View>
                </View>

                <CustomSwitch value={newUI} onChange={(val) => handleChangeUI(val)} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 18,
        marginHorizontal: 8,
        borderWidth: 1,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
        paddingRight: 16,
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },
    textBlock: {
        flex: 1,
    },
    title: {
        fontWeight: "700",
        fontSize: 18,
    },
    description: {
        fontSize: 13,
        marginTop: 2,
        lineHeight: 18,
    },
})
