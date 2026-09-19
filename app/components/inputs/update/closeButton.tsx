import { PressableScale } from "pressto"
import Svg, { Path } from "react-native-svg"
import { GlassView } from "expo-glass-effect"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

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
                width: 48,
                height: 48,
            }}
        >
            <GlassView
                glassEffectStyle="regular"
                isInteractive
                tintColor={vars.secondaryBackgroundColor}
                style={{
                    borderRadius: BORDER_RADIUS_FULL,
                    overflow: "hidden",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                    width: 48,
                    height: 48,
                }}
            >
                <Svg width={20} height={20} viewBox="-0.5 0 25 25">
                    <Path d="M3 21.32L21 3.32" stroke={vars.textColor} strokeWidth={1.5} />
                    <Path d="M3 3.32L21 21.32" stroke={vars.textColor} strokeWidth={1.5} />
                </Svg>
            </GlassView>
        </PressableScale>
    )
}
