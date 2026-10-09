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
        <View style={styles.wrapper}>
            <PressableScale onPress={open} style={styles.iconButton}>
                {theme === "light" ? <Sun size={20} color="black" /> : <Moon size={20} color="white" />}
            </PressableScale>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        marginLeft: 16,
    },
    iconButton: {
        padding: 8,
        borderRadius: BORDER_RADIUS_FULL,
    },
})
