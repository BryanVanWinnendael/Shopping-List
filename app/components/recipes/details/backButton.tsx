import { PressableScale } from "pressto"
import { GlassView } from "expo-glass-effect"
import { ChevronLeft } from "lucide-react-native"
import { router } from "expo-router"

import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

export default function BackButton() {
    const { vars, theme } = useThemes()

    return (
        <PressableScale
            onPress={() => router.back()}
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
                <ChevronLeft size={28} color={vars.textColor} style={{ marginRight: 2 }} />
            </GlassView>
        </PressableScale>
    )
}
