import { StyleSheet } from "react-native"
import { AlignLeft } from "lucide-react-native"
import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"
import GlassOrBlurView from "@/components/glassOrBlurView"
import { useSettingsStore } from "@/stores/useSettingsStore"

type Props = {
    open: () => void
}

export default function NavButton({ open }: Props) {
    const { vars } = useThemes()
    const { newUI } = useSettingsStore()

    return (
        <PressableScale onPress={open} style={styles.touchable}>
            <GlassOrBlurView
                borderRadius={999}
                backgroundColor={vars.secondaryBackgroundColor}
                borderColor={newUI ? `${vars.secondaryBorderColor}50` : vars.secondaryBorderColor}
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
                <AlignLeft size={24} color={vars.textColor} />
            </GlassOrBlurView>
        </PressableScale>
    )
}

const styles = StyleSheet.create({
    touchable: {
        marginLeft: 8,
        marginBottom: 8,
    },
})
