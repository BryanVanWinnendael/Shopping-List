import { PressableScale } from "pressto"
import { Plus } from "lucide-react-native"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { StyleSheet, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, DOCK_BOTTOM, DOCK_SIDE, FAB_ICON_SIZE, FAB_SIZE } from "@/lib/theme"

type Props = {
    onPress: () => void
}

export default function BottomSheetButton({ onPress }: Props) {
    const { vars } = useThemes()

    return (
        <View style={styles.container}>
            <LiquidGlassView style={styles.glass} isInteractive>
                <PressableScale onPress={onPress} style={styles.button}>
                    <Plus size={FAB_ICON_SIZE} strokeWidth={2} color={vars.textColor} />
                </PressableScale>
            </LiquidGlassView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: DOCK_BOTTOM,
        right: DOCK_SIDE,
        height: FAB_SIZE,
        width: FAB_SIZE,
        zIndex: 1,
    },
    glass: {
        height: FAB_SIZE,
        width: FAB_SIZE,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    button: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        justifyContent: "center",
        alignItems: "center",
    },
})
