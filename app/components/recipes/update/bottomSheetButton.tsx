import { Pencil } from "lucide-react-native"
import { PressableScale } from "pressto"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { StyleSheet } from "react-native"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, FAB_ICON_SIZE, FAB_SIZE } from "@/lib/theme"

type Props = {
    open?: () => void
}

export default function BottomSheetButton({ open }: Props) {
    const { vars } = useThemes()

    return (
        <PressableScale onPress={open} style={styles.button}>
            <LiquidGlassView style={styles.glass} isInteractive>
                <Pencil size={FAB_ICON_SIZE} color={vars.textColor} />
            </LiquidGlassView>
        </PressableScale>
    )
}

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
        width: FAB_SIZE,
        height: FAB_SIZE,
    },
    glass: {
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        width: FAB_SIZE,
        height: FAB_SIZE,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
})
