import { useNavigation } from "@react-navigation/native"
import { ArrowLeft } from "lucide-react-native"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"

export default function BackButton() {
    const { vars } = useThemes()
    const navigation = useNavigation()

    return (
        <PressableScale
            onPress={() => navigation.goBack()}
            style={{
                justifyContent: "center",
                alignItems: "center",
                width: 40,
                height: 40,
            }}
        >
            <GlassOrBlurView
                borderColor={`${vars.borderColor}50`}
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
                <ArrowLeft size={20} color={vars.textColor} />
            </GlassOrBlurView>
        </PressableScale>
    )
}
