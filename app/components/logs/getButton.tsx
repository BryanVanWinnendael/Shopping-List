import { ActivityIndicator, Text } from "react-native"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    getLogs: () => void
    loading: boolean
}

export default function GetButton({ getLogs, loading }: Props) {
    const { vars } = useThemes()

    return (
        <PressableScale
            enabled={!loading}
            onPress={getLogs}
            style={{
                paddingVertical: 10,
                borderRadius: 24,
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
                {loading ? (
                    <ActivityIndicator color={vars.textColor} />
                ) : (
                    <Text style={{ color: vars.textColor, fontWeight: "600", fontSize: 16 }}>Get Logs</Text>
                )}
            </GlassOrBlurView>
        </PressableScale>
    )
}
