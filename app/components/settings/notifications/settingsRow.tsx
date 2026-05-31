import React from "react"
import {StyleSheet, Text, View} from "react-native"
import CustomSwitch from "@/components/customSwitch"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    label: string
    description?: string
    value: boolean
    onToggle: () => void
}

export default function SettingRow({ label, description, value, onToggle }: Props) {
    const { vars } = useThemes()

    return (
        <View style={styles.row}>
            <View style={styles.textBlock}>
                <Text style={[styles.title, { color: vars.textColor }]}>{label}</Text>

                {description && <Text style={styles.description}>{description}</Text>}
            </View>

            <CustomSwitch value={value} onChange={onToggle} />
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    textBlock: {
        flex: 1,
        marginRight: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    description: {
        fontSize: 12,
        marginTop: 2,
        color: "#9ca3af",
    },
})
