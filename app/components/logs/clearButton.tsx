import { ActivityIndicator, View } from "react-native"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { Trash } from "lucide-react-native"
import { SHADOW_STYLE } from "@/lib/constants"

type Props = {
    clearLogs: () => void
    loading: boolean
}

export default function ClearButton({ clearLogs, loading }: Props) {
    const { vars } = useThemes()

    return (
        <View
            style={[
                {
                    position: "absolute",
                    bottom: 24,
                    right: 24,
                    zIndex: 1,
                },
                SHADOW_STYLE,
            ]}
        >
            <GlassOrBlurView
                style={{
                    flexDirection: "row",
                    borderRadius: 26,
                    overflow: "hidden",
                    borderWidth: 1,
                }}
                backgroundColor={vars.secondaryBackgroundColor}
                borderColor={`${vars.secondaryBorderColor}50`}
            >
                <PressableScale
                    enabled={!loading}
                    onPress={clearLogs}
                    style={{
                        height: 52,
                        width: 52,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {loading ? (
                        <ActivityIndicator color={vars.textColor} />
                    ) : (
                        <Trash size={20} color={vars.textColor} />
                    )}
                </PressableScale>
            </GlassOrBlurView>
        </View>
    )
}
