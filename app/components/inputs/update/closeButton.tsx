import { StyleSheet } from "react-native"
import { PressableScale } from "pressto"
import Svg, { Path } from "react-native-svg"
import LiquidGlassView from "@/components/native/liquidGlassView"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, FAB_ICON_SIZE, FAB_SIZE } from "@/lib/theme"

type Props = {
    close: () => void
}

export default function CloseButton({ close }: Props) {
    const { vars } = useThemes()

    return (
        <PressableScale onPress={close} accessibilityRole="button" accessibilityLabel="Close" style={styles.button}>
            <LiquidGlassView style={styles.glass} isInteractive>
                <Svg width={FAB_ICON_SIZE} height={FAB_ICON_SIZE} viewBox="-0.5 0 25 25">
                    <Path d="M3 21.32L21 3.32" stroke={vars.textColor} strokeWidth={1.5} />
                    <Path d="M3 3.32L21 21.32" stroke={vars.textColor} strokeWidth={1.5} />
                </Svg>
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
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
})
