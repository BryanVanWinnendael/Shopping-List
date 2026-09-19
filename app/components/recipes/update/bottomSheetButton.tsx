import { Pencil } from "lucide-react-native"
import { PressableScale } from "pressto"
import { GlassView } from "expo-glass-effect"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    open?: () => void
}

export default function BottomSheetButton({ open }: Props) {
    const { vars, theme } = useThemes()

    return (
        <PressableScale
            onPress={open}
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
                colorScheme={theme === "light" ? "light" : "dark"}
                tintColor={vars.secondaryBackgroundColor}
                style={{
                    borderRadius: BORDER_RADIUS_FULL,
                    overflow: "hidden",
                    justifyContent: "center",
                    alignItems: "center",
                    width: 48,
                    height: 48,
                }}
            >
                <Pencil size={20} color={vars.textColor} />
            </GlassView>
        </PressableScale>
    )
}
