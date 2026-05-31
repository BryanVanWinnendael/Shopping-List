import { PressableScale } from "pressto"
import Svg, { Path } from "react-native-svg"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    close: () => void
}

export default function CloseButton({ close }: Props) {
    const { vars } = useThemes()

    return (
        <PressableScale
            onPress={close}
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
                <Svg width="20" height="20" viewBox="-0.5 0 25 25">
                    <Path d="M3 21.32L21 3.32" stroke={vars.textColor} strokeWidth="1.5" />
                    <Path d="M3 3.32L21 21.32" stroke={vars.textColor} strokeWidth="1.5" />
                </Svg>
            </GlassOrBlurView>
        </PressableScale>
    )
}
