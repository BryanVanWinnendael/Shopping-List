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
                bottom: 30,
                right: 24,
                borderRadius: 50,
                width: 48,
                height: 48,
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
            }}
            backgroundColor={vars.secondaryBackgroundColor}
            borderColor={newUI ? `${vars.secondaryBorderColor}50` : vars.secondaryBorderColor}
        >
            <PressableScale onPress={onPress} style={{ justifyContent: "center", alignItems: "center" }}>
                <Plus size={20} color={vars.textColor} />
            </PressableScale>
        </GlassOrBlurView>
    )
}
