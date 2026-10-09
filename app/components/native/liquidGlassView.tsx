import { ReactNode } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { GlassView } from "expo-glass-effect"

import useThemes from "@/hooks/themes/useThemes"

const LIGHT_VEIL = "rgba(255,255,255,0.2)"
const LIGHT_TINT = "rgba(255,255,255,0.3)"

type Props = {
    children: ReactNode
    style?: StyleProp<ViewStyle>
    isInteractive?: boolean
    /** Override the native glass tint used in light mode. */
    tintColor?: string
    /** Force a glass style instead of the automatic clear (light) / regular (dark). */
    effectStyle?: "clear" | "regular"
}

export const LIQUID_LIGHT_VEIL = LIGHT_VEIL
export const LIQUID_LIGHT_TINT = LIGHT_TINT

export function useLiquidGlass() {
    const { vars, appearance } = useThemes()
    const isLight = appearance === "light"

    return {
        appearance,
        glassEffectStyle: (isLight ? "clear" : "regular") as "clear" | "regular",
        tintColor: isLight ? LIGHT_TINT : undefined,
        glassTint: isLight
            ? { backgroundColor: LIGHT_VEIL, borderColor: vars.secondaryBorderColor }
            : { borderColor: vars.secondaryBorderColor },
    }
}

export default function LiquidGlassView({ children, style, isInteractive, tintColor, effectStyle }: Props) {
    const { appearance } = useThemes()
    const { glassEffectStyle, tintColor: defaultTint, glassTint } = useLiquidGlass()
    const isLight = appearance === "light"

    return (
        <GlassView
            glassEffectStyle={effectStyle ?? glassEffectStyle}
            tintColor={tintColor ?? (isLight ? defaultTint : undefined)}
            isInteractive={isInteractive}
            colorScheme={appearance}
            style={[glassTint, style]}
        >
            {children}
        </GlassView>
    )
}
