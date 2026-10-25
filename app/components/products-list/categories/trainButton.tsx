import { ActivityIndicator, StyleSheet, Text } from "react-native"
import { PressableScale } from "pressto"
import LiquidGlassView from "@/components/native/liquidGlassView"

import useThemes from "@/hooks/themes/useThemes"
import { BAR_HEIGHT, BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    training: boolean
    trainModel: () => void
}

export default function TrainButton({ training, trainModel }: Props) {
    const { vars } = useThemes()

    return (
        <PressableScale enabled={!training} onPress={trainModel} style={styles.button}>
            <LiquidGlassView isInteractive={!training} style={styles.glassContent}>
                {training ? (
                    <ActivityIndicator size="small" color={vars.textColor} />
                ) : (
                    <Text style={[styles.label, { color: vars.textColor }]}>Train Model</Text>
                )}
            </LiquidGlassView>
        </PressableScale>
    )
}

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        bottom: 30,
        right: 15,
        zIndex: 10,
        height: BAR_HEIGHT,
    },
    glassContent: {
        height: BAR_HEIGHT,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    label: {
        fontWeight: "600",
        fontSize: 16,
    },
})
