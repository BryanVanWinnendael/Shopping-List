import { ActivityIndicator, View } from "react-native"
import { PressableScale } from "pressto"
import { GlassView } from "expo-glass-effect"
import { Trash } from "lucide-react-native"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    clearLogs: () => void
    loading: boolean
}

export default function ClearButton({ clearLogs, loading }: Props) {
    const { vars, theme } = useThemes()

    return (
        <View
            style={{
                position: "absolute",
                bottom: 24,
                right: 24,
                zIndex: 1,
            }}
        >
            <GlassView
                glassEffectStyle="regular"
                isInteractive={!loading}
                colorScheme={theme === "light" ? "light" : "dark"}
                style={{
                    flexDirection: "row",
                    borderRadius: BORDER_RADIUS_FULL,
                    overflow: "hidden",
                    width: 48,
                    height: 48,
                }}
            >
                <PressableScale
                    enabled={!loading}
                    onPress={clearLogs}
                    style={{
                        height: 48,
                        width: 48,
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
            </GlassView>
        </View>
    )
}
