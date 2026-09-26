import { StyleSheet } from "react-native"
import { AlignLeft } from "lucide-react-native"
import { PressableScale } from "pressto"
import { GlassView } from "expo-glass-effect"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    open: () => void
}

export default function NavButton({ open }: Props) {
    const { vars, theme } = useThemes()

    return (
        <PressableScale onPress={open} style={styles.touchable}>
            <GlassView
                glassEffectStyle="regular"
                isInteractive
                colorScheme={theme === "light" ? "light" : "dark"}
                style={styles.glass}
            >
                <AlignLeft size={24} strokeWidth={2.2} color={vars.textColor} />
            </GlassView>
        </PressableScale>
    )
}

const styles = StyleSheet.create({
    touchable: {
        width: 48,
        height: 48,
        marginLeft: 12,
        marginBottom: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    glass: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
    },
})
