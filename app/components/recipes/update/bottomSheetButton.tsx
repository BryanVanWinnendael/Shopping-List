import { Pencil } from "lucide-react-native"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    open?: () => void
}

export default function BottomSheetButton({ open }: Props) {
    const { vars } = useThemes()

    return (
        <PressableScale
            onPress={open}
            style={{
                justifyContent: "center",
                alignItems: "center",
                width: 40,
                height: 40,
            }}
        >
            <GlassOrBlurView
                borderColor={`${vars.secondaryBorderColor}50`}
                style={[
                    {
                        borderRadius: 50,
                        overflow: "hidden",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 8,
                        width: 40,
                        height: 40,
                    },
                ]}
            >
                <Pencil size={20} color={vars.textColor} />
            </GlassOrBlurView>
        </PressableScale>
    )
}
