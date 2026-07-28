import { ActivityIndicator, Text } from "react-native"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { SHADOW_STYLE } from "@/lib/constants"

type Props = {
    training: boolean
    trainModel: () => void
}

export default function TrainButton({ training, trainModel }: Props) {
    const { vars } = useThemes()

    return (
        <PressableScale
            enabled={!training}
            onPress={trainModel}
            style={[
                {
                    position: "absolute",
                    bottom: 30,
                    right: 15,
                    borderRadius: 8,
                    zIndex: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 52,
                },
                SHADOW_STYLE,
            ]}
        >
            <GlassOrBlurView
                backgroundColor={vars.secondaryBackgroundColor}
                borderColor={`${vars.secondaryBorderColor}50`}
                style={[
                    {
                        borderRadius: 24,
                        overflow: "hidden",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 8,
                        height: 52,
                        paddingHorizontal: 8,
                    },
                ]}
            >
                {training ? (
                    <ActivityIndicator size="small" color={vars.textColor} />
                ) : (
                    <Text style={{ color: vars.textColor, fontWeight: "600", fontSize: 16 }}>Train Model</Text>
                )}
            </GlassOrBlurView>
        </PressableScale>
    )
}
