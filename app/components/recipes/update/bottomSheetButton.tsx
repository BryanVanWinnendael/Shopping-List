import { Pencil } from "lucide-react-native"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { SHADOW_STYLE_LIGHT } from "@/lib/constants"

type Props = {
    open?: () => void
}

export default function BottomSheetButton({ open }: Props) {
    const { vars } = useThemes()

    return (
        <PressableScale
            onPress={open}
            style={[
                {
                    justifyContent: "center",
                    alignItems: "center",
                    width: 48,
                    height: 48,
                },
                SHADOW_STYLE_LIGHT,
            ]}
        >
            <GlassOrBlurView
                borderColor={`${vars.secondaryBorderColor}50`}
                style={[
                    {
                        borderRadius: 50,
                        overflow: "hidden",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 48,
                        height: 48,
                    },
                ]}
            >
                <Pencil size={20} color={vars.textColor} />
            </GlassOrBlurView>
        </PressableScale>
    )
}
