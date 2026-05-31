import { StyleSheet, Text } from "react-native"
import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import { useSettingsStore } from "@/stores/useSettingsStore"

type Props = {
    open: () => void
}

export default function BottomSheetButton({ open }: Props) {
    const { theme, vars } = useThemes()
    const { user } = useSettingsStore()

    return (
        <PressableScale style={[styles.button, { backgroundColor: vars.secondaryBackgroundColor }]} onPress={open}>
            <Text
                style={{
                    color: theme === "light" ? "#5C5C5C" : "#88888C",
                    fontSize: 16,
                }}
            >
                {user || "None"}
            </Text>
        </PressableScale>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 14,
        margin: 16,
    },
    sheetContainer: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    userOptionContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
})
