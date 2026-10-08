import { PressableScale } from "pressto"
import { Plus } from "lucide-react-native"
import { GlassView } from "expo-glass-effect"
import { View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    onPress: () => void
}

export default function BottomSheetButton({ onPress }: Props) {
    const { vars, appearance } = useThemes()

    return (
        <View
            style={{
                position: "absolute",
                bottom: 26,
                right: 20,
                height: 48,
                width: 48,
                zIndex: 1,
            }}
        >
            <GlassView
                glassEffectStyle="regular"
                isInteractive
                colorScheme={appearance}
                style={{
                    height: 48,
                    width: 48,
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    borderRadius: BORDER_RADIUS_FULL,
                }}
            >
                <PressableScale
                    onPress={onPress}
                    style={{
                        width: 48,
                        height: 48,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Plus size={24} strokeWidth={2} color={vars.textColor} />
                </PressableScale>
            </GlassView>
        </View>
    )
}
