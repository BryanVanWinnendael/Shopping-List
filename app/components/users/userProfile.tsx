import { Text, StyleSheet } from "react-native"
import { useSettings } from "@/stores/useSettings"
import { AlignLeft } from "lucide-react-native"
import { DEFAULT_ACOLOR, getTextColor } from "@/lib/theme"
import { LinearGradient } from "expo-linear-gradient"
import { PressableScale } from "pressto"
import { GlassView } from "expo-glass-effect"
import { GRADIENT } from "@/lib/constants"

type Props = {
  onPress?: () => void
}

export function UserProfile({ onPress }: Props) {
  const { user, theme, aColor, menuIcon } = useSettings()

  const textColor = getTextColor(theme)

  if (menuIcon) {
    return (
      <PressableScale onPress={onPress} style={styles.touchable}>
        <AlignLeft size={24} color={textColor} style={{ marginLeft: 8 }} />
      </PressableScale>
    )
  }

  if (aColor === DEFAULT_ACOLOR) {
    return (
      <PressableScale onPress={onPress} style={styles.touchable}>
        <GlassView
          glassEffectStyle="clear"
          tintColor="transparent"
          style={styles.glassCircle}
        >
          <LinearGradient
            colors={GRADIENT}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            locations={[0, 0.81, 1]}
            style={styles.gradientCircle}
          >
            <Text style={styles.initialText}>{user?.charAt(0)}</Text>
          </LinearGradient>
        </GlassView>
      </PressableScale>
    )
  }

  return (
    <PressableScale onPress={onPress} style={styles.touchable}>
      <GlassView
        glassEffectStyle="clear"
        tintColor={aColor}
        style={[
          styles.glassCircle,
          {
            borderColor: theme === "light" ? "#e5e7eb" : "#272729",
          },
        ]}
      >
        <Text style={styles.initialText}>{user?.charAt(0)}</Text>
      </GlassView>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  touchable: {
    marginLeft: 8,
    marginBottom: 8,
  },
  glassCircle: {
    borderRadius: 9999,
    height: 35,
    width: 35,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  gradientCircle: {
    borderRadius: 9999,
    height: 35,
    width: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textTransform: "capitalize",
  },
})
