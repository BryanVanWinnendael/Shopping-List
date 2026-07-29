import { useNavigation } from "@react-navigation/native"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { SHADOW_STYLE } from "@/lib/constants"
import { ChevronLeft } from "lucide-react-native"

export default function BackButton() {
    const { vars } = useThemes()
    const navigation = useNavigation()

    return (
        <PressableScale
            onPress={() => navigation.goBack()}
            style={[
                {
                    justifyContent: "center",
                    alignItems: "center",
                    width: 48,
                    height: 48,
                },
                SHADOW_STYLE,
            ]}
        >
            <GlassOrBlurView
                borderColor={`${vars.borderColor}50`}
                style={[
                    {
                        borderRadius: 100,
                        overflow: "hidden",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 48,
                        height: 48,
                    },
                ]}
            >
                <ChevronLeft size={28} color={vars.textColor} style={{ marginRight: 2 }} />
            </GlassOrBlurView>
        </PressableScale>
    )
}
