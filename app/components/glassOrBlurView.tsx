import { StyleProp, ViewStyle } from "react-native"
import { BlurView } from "expo-blur"
import { GlassView } from "expo-glass-effect"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { ReactNode } from "react"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    children?: ReactNode
    style?: StyleProp<ViewStyle>
    blur?: number
    borderColor?: string
    backgroundColor?: string
    glassBackgroundColor?: string
    borderRadius?: number
    glassBorderWidth?: number
    blurBorderWidth?: number
    forceBlur?: boolean
    glassEffectStyle?: "regular" | "clear"
}

export default function GlassOrBlurView({
    children,
    style,
    blur = 50,
    borderColor,
    backgroundColor,
    glassBackgroundColor,
    borderRadius = 20,
    glassBorderWidth = 2,
    blurBorderWidth = 1,
    forceBlur = false,
    glassEffectStyle = "clear",
}: Props) {
    const { vars, theme } = useThemes()
    const { newUI } = useSettingsStore()

    if (newUI && !forceBlur) {
        return (
            <GlassView
                glassEffectStyle={glassEffectStyle}
                tintColor={glassBackgroundColor ? glassBackgroundColor : (backgroundColor ?? vars.backgroundColor)}
                style={[
                    {
                        borderWidth: glassBorderWidth,
                        borderColor: borderColor ?? vars.backgroundColor,
                        borderRadius: borderRadius,
                        overflow: "hidden",
                    },
                    style,
                ]}
            >
                {children}
            </GlassView>
        )
    }

    return (
        <BlurView
            intensity={blur}
            tint={theme === "light" ? "light" : "dark"}
            style={[
                {
                    borderRadius: borderRadius,
                    overflow: "hidden",
                    backgroundColor: backgroundColor ? `${backgroundColor}50` : `${vars.backgroundColor}50`,
                    borderWidth: blurBorderWidth,
                    borderColor: borderColor ?? vars.borderColor,
                },
                style,
            ]}
        >
            {children}
        </BlurView>
    )
}
