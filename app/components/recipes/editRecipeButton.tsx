import { Pencil } from "lucide-react-native"
import { useSettings } from "@/stores/useSettings"
import { getTextColor } from "@/lib/theme"
import { PressableScale } from "pressto"
import { GlassOrBlurView } from "../glassOrBlurView"

type Props = {
  openSheet?: () => void
}

export function EditRecipeButton({ openSheet }: Props) {
  const { theme } = useSettings()

  const textColor = getTextColor(theme)

  return (
    <PressableScale
      onPress={openSheet}
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: 40,
        height: 40,
      }}
    >
      <GlassOrBlurView
        style={[
          {
            borderRadius: 50,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 8,
            width: 40,
            height: 40,
          },
        ]}
      >
        <Pencil size={20} color={textColor} />
      </GlassOrBlurView>
    </PressableScale>
  )
}
