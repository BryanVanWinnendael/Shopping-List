import { ActivityIndicator, Text } from "react-native"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"

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
            style={{
                position: "absolute",
                bottom: 30,
                right: 15,
                borderRadius: 8,
                zIndex: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                height: 40,
            }}
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
                        height: 40,
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
