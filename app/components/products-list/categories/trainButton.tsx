import { ActivityIndicator, Text } from "react-native"
import { PressableScale } from "pressto"
import { GlassView } from "expo-glass-effect"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_L } from "@/lib/theme"

type Props = {
    training: boolean
    trainModel: () => void
}

export default function TrainButton({ training, trainModel }: Props) {
    const { vars, theme } = useThemes()

    return (
        <PressableScale
            enabled={!training}
            onPress={trainModel}
            style={{
                position: "absolute",
                bottom: 30,
                right: 15,
                zIndex: 10,
                height: 48,
            }}
        >
            <GlassView
                glassEffectStyle="regular"
                isInteractive={!training}
                colorScheme={theme === "light" ? "light" : "dark"}
                style={{
                    height: 48,
                    borderRadius: BORDER_RADIUS_L,
                    overflow: "hidden",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 14,
                }}
            >
                {training ? (
                    <ActivityIndicator size="small" color={vars.textColor} />
                ) : (
                    <Text
                        style={{
                            color: vars.textColor,
                            fontWeight: "600",
                            fontSize: 16,
                        }}
                    >
                        Train Model
                    </Text>
                )}
            </GlassView>
        </PressableScale>
    )
}
