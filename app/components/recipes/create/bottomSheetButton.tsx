import { PressableScale } from "pressto"
import { Plus } from "lucide-react-native"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { View } from "react-native"
import { SHADOW_STYLE } from "@/lib/constants"

type Props = {
    onPress: () => void
}

export default function BottomSheetButton({ onPress }: Props) {
    const { vars } = useThemes()

    return (
        <View
            style={[
                {
                    position: "absolute",
                    bottom: 26,
                    right: 20,
                    height: 48,
                    width: 48,
                    zIndex: 1,
                },
                SHADOW_STYLE,
            ]}
        >
            <GlassOrBlurView
                style={{
                    height: 48,
                    width: 48,
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    borderRadius: 100,
                }}
                backgroundColor={vars.secondaryBackgroundColor}
                borderColor={`${vars.secondaryBorderColor}50`}
            >
                <PressableScale onPress={onPress} style={{ justifyContent: "center", alignItems: "center" }}>
                    <Plus size={24} color={vars.textColor} />
                </PressableScale>
            </GlassOrBlurView>
        </View>
    )
}
