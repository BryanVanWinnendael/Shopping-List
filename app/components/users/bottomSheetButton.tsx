import { StyleSheet, Text } from "react-native"
import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    open: () => void
}

export default function BottomSheetButton({ open }: Props) {
    const { theme, vars } = useThemes()
    const { user } = useSettingsStore()

    return (
        <PressableScale style={[styles.button, { backgroundColor: vars.secondaryBackgroundColor }]} onPress={open}>
            <Text style={[styles.label, { color: theme === "light" ? "#5C5C5C" : "#88888C" }]}>{user || "None"}</Text>
        </PressableScale>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS_M,
        margin: 16,
    },
    label: {
        fontSize: 16,
    },
})
