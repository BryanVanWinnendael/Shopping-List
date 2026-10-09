import { StyleSheet } from "react-native"
import { AlignLeft } from "lucide-react-native"
import { PressableScale } from "pressto"
import LiquidGlassView from "@/components/native/liquidGlassView"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, FAB_ICON_SIZE, FAB_SIZE } from "@/lib/theme"

type Props = {
    open: () => void
}

export default function NavButton({ open }: Props) {
    const { vars } = useThemes()

    return (
        <PressableScale onPress={open} style={styles.touchable}>
            <LiquidGlassView style={styles.glass} isInteractive>
                <AlignLeft size={FAB_ICON_SIZE} strokeWidth={2.2} color={vars.textColor} />
            </LiquidGlassView>
        </PressableScale>
    )
}

const styles = StyleSheet.create({
    touchable: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        marginLeft: 12,
        marginBottom: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    glass: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },
})
