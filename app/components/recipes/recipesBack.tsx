import { useNavigation } from "@react-navigation/native"
import { ArrowLeft } from "lucide-react-native"
import { useSettings } from "@/stores/useSettings"
import { getTextColor } from "@/lib/theme"
import { PressableScale } from "pressto"
import { GlassOrBlurView } from "../glassOrBlurView"

export function RecipesBack() {
  const { theme } = useSettings()
  const navigation = useNavigation()

  const textColor = getTextColor(theme)

  return (
    <GlassOrBlurView
      style={[
        {
          borderRadius: 50,
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 8,
        },
      ]}
    >
      <PressableScale
        onPress={() => navigation.goBack()}
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: 40,
          height: 40,
        }}
      >
        <ArrowLeft size={20} color={textColor} />
      </PressableScale>
    </GlassOrBlurView>
  )
}
