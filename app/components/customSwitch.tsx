import React from "react"
import { StyleSheet, Switch, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    value: boolean
    onChange: (value: boolean) => void
    disabled?: boolean
}

export default function CustomSwitch({ value, onChange, disabled = false }: Props) {
    const { vars } = useThemes()
    const { newUI } = useSettingsStore()

    return (
        <View style={styles.container}>
            <Switch
                value={value}
                onValueChange={onChange}
                disabled={disabled}
                trackColor={{
                    false: "#767577",
                    true: vars.accentColor,
                }}
                thumbColor={value ? (newUI ? "#ffffff" : "#ffffff") : "#f4f3f4"}
                ios_backgroundColor="#767577"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
    },
})
