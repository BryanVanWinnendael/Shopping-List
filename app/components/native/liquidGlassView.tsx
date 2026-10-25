import { ReactNode } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { GlassView } from "expo-glass-effect"

import useThemes from "@/hooks/themes/useThemes"

const LIGHT_TINT = "rgba(255,255,255,0.2)"

// Light mode aims at the ChatGPT composer: a soft grey pill with a clearly
// defined edge, sitting on a white page. Both parts matter -- the fill alone
// disappears into the page, and a border alone reads as a hard-edged box rather
// than something floating. Kept translucent so the list still shows through.
const LIGHT_FILL = "rgba(0,0,0,0.06)"
const LIGHT_RIM = "rgba(0,0,0,0.16)"

// Dark mode is frameless: every dark border token is darker than the page, so any
// rim draws a black line. Callers still declare borderWidth: 1, and React Native
// falls back to black for an unset borderColor, so it has to be cleared
// explicitly rather than left off.
const NO_RIM = "transparent"

type Props = {
    children: ReactNode
    style?: StyleProp<ViewStyle>
    isInteractive?: boolean
    /** Override the native glass tint used in light mode. */
    tintColor?: string
    /** Force a glass style instead of the automatic clear (light) / regular (dark). */
    effectStyle?: "clear" | "regular"
}

export const LIQUID_LIGHT_FILL = LIGHT_FILL
export const LIQUID_LIGHT_TINT = LIGHT_TINT
export const LIQUID_LIGHT_RIM = LIGHT_RIM

export function useLiquidGlass() {
    const { appearance } = useThemes()
    const isLight = appearance === "light"

    return {
        appearance,
        glassEffectStyle: (isLight ? "clear" : "regular") as "clear" | "regular",
        tintColor: isLight ? LIGHT_TINT : undefined,
        glassTint: isLight ? { backgroundColor: LIGHT_FILL, borderColor: LIGHT_RIM } : { borderColor: NO_RIM },
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
