import { PressableScale } from "pressto"
import { Plus } from "lucide-react-native"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { useSettingsStore } from "@/stores/useSettingsStore"

type Props = {
    onPress: () => void
}

export default function BottomSheetButton({ onPress }: Props) {
    const { newUI } = useSettingsStore()
    const { vars } = useThemes()

    return (
        <GlassOrBlurView
            style={{
                position: "absolute",
                bottom: 26,
                right: 20,
                borderRadius: 50,
                height: 52,
                width: 52,
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                zIndex: 1,
            }}
            backgroundColor={vars.secondaryBackgroundColor}
            borderColor={`${vars.secondaryBorderColor}50`}
        >
            <PressableScale onPress={onPress} style={{ justifyContent: "center", alignItems: "center" }}>
                <Plus size={20} color={vars.textColor} />
            </PressableScale>
        </GlassOrBlurView>
    )
}
