import { StyleSheet, View } from "react-native"
import { Moon, Sun } from "lucide-react-native"
import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    open: () => void
}

export default function BottomSheetButton({ open }: Props) {
    const { theme } = useThemes()

    return (
        <View style={{ marginLeft: 16 }}>
            <PressableScale onPress={open} style={styles.iconButton}>
                {theme === "light" ? <Sun size={20} color="black" /> : <Moon size={20} color="white" />}
            </PressableScale>
        </View>
    )
}

const styles = StyleSheet.create({
    iconButton: {
        padding: 8,
        borderRadius: BORDER_RADIUS_FULL,
    },
    sheetContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    option: {
        paddingVertical: 12,
    },
    optionText: {
        fontSize: 16,
    },
})
