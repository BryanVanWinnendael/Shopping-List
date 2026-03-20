import { StyleProp, ViewStyle } from "react-native"
import { BlurView } from "expo-blur"
import { GlassView } from "expo-glass-effect"
import { useSettings } from "@/stores/useSettings"
import {
  getBackgroundColor,
  getBlurBackgroundColor,
  getBlurIntensity,
  getBorderColor,
} from "@/lib/theme"

type Props = {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  blur?: number
  glassBackgroundColor?: string
  givenGlassBorderColor?: string
  blurBackground?: string
  givenBlurBorderColor?: string
  forceBlur?: boolean
  borderRadius?: number
  blurBorderWidth?: number
}

export function GlassOrBlurView({
  children,
  style,
  blur,
  glassBackgroundColor,
  givenGlassBorderColor,
  blurBackground,
  givenBlurBorderColor,
  forceBlur = false,
  borderRadius,
  blurBorderWidth,
}: Props) {
  const { theme, newUI } = useSettings()

  const backgroundColor = getBackgroundColor(theme)
  const blurBackgroundColor = getBlurBackgroundColor(theme)
  const blurIntensity = getBlurIntensity(theme)
  const borderColor = getBorderColor(theme)

  if (newUI && !forceBlur) {
    return (
      <GlassView
        glassEffectStyle="clear"
        tintColor={glassBackgroundColor ?? backgroundColor}
        style={[
          {
            borderWidth: 2,
            borderColor: givenGlassBorderColor ?? backgroundColor,
            borderRadius: borderRadius ?? 12,
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
      intensity={blur ?? blurIntensity}
      tint={theme === "light" ? "light" : "dark"}
      style={[
        {
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: blurBackground ?? blurBackgroundColor,
          borderWidth: blurBorderWidth ?? 0.2,
          borderColor: givenBlurBorderColor ?? borderColor,
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  )
}
